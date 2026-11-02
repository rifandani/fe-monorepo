import { Metric } from "effect";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric as WebVitalsMetric } from "web-vitals";

import {
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/core/constants/global";
import { appRuntime } from "@/core/services/runtime";
import { metricReader } from "@/core/services/telemetry";

/**
 * Web vitals are judged at p75, so generic buckets are unusable here: every
 * non-zero CLS sample would land in one bucket and any percentile would be
 * interpolated out of thin air. Each set below places the metric's Good/Poor
 * thresholds exactly on a bucket edge, so "% of sessions rated good" is an
 * exact count.
 *
 * @see https://web.dev/articles/vitals#core-web-vitals
 */
export const webVitalsHistograms = {
  // good ≤ 2500ms, poor > 4000ms
  lcp: Metric.histogram(METRICS_METER_WEB_VITALS_LCP, {
    description: "Largest Contentful Paint (ms)",
    boundaries: [
      500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10_000,
    ],
  }),
  // good ≤ 200ms, poor > 500ms
  inp: Metric.histogram(METRICS_METER_WEB_VITALS_INP, {
    description: "Interaction to Next Paint (ms)",
    boundaries: [25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 2000],
  }),
  // unitless, good ≤ 0.1, poor > 0.25
  cls: Metric.histogram(METRICS_METER_WEB_VITALS_CLS, {
    description: "Cumulative Layout Shift",
    boundaries: [0.01, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.4, 0.6, 1],
  }),
  // good ≤ 1800ms, poor > 3000ms
  fcp: Metric.histogram(METRICS_METER_WEB_VITALS_FCP, {
    description: "First Contentful Paint (ms)",
    boundaries: [300, 600, 1000, 1400, 1800, 2200, 3000, 4000, 6000, 10_000],
  }),
  // good ≤ 800ms, poor > 1800ms
  ttfb: Metric.histogram(METRICS_METER_WEB_VITALS_TTFB, {
    description: "Time to First Byte (ms)",
    boundaries: [100, 200, 400, 600, 800, 1200, 1800, 2500, 4000, 8000],
  }),
} as const;

type Histogram = (typeof webVitalsHistograms)[keyof typeof webVitalsHistograms];

/** Keys are snake_case per OTEL semconv; `delta` is omitted (unbounded cardinality). */
export const webVitalsAttributes = (metric: WebVitalsMetric) => ({
  navigation_type: metric.navigationType,
  rating: metric.rating,
});

type WebVitalsAttributes = ReturnType<typeof webVitalsAttributes>;

interface Pending {
  attributes: WebVitalsAttributes;
  histogram: Histogram;
  value: number;
}

/** Latest sample per metric id (CLS/INP re-report; flushed once when hidden). */
const pending = new Map<string, Pending>();
const recordedIds = new Set<string>();

const record = (
  histogram: Histogram,
  value: number,
  attributes: WebVitalsAttributes
) => {
  appRuntime.runSync(
    Metric.update(Metric.withAttributes(histogram, attributes), value)
  );
};

const drainReader = async (): Promise<void> => {
  try {
    await metricReader.forceFlush();
  } catch {
    // The page is going away, so a failed export is not actionable — but an
    // unhandled rejection here would feed back into global error reporting.
  }
};

/**
 * Record every buffered sample, then drain the reader.
 *
 * The drain runs unconditionally: LCP/FCP/TTFB are recorded immediately but
 * only leave the browser on the reader's periodic tick, so a hide with nothing
 * pending can still be holding an unexported sample.
 */
const flushPending = (): void => {
  for (const [id, entry] of pending) {
    if (recordedIds.has(id)) {
      continue;
    }

    recordedIds.add(id);
    record(entry.histogram, entry.value, entry.attributes);
  }

  pending.clear();
  void drainReader();
};

/** Record immediately; skip if this metric id was already exported. */
const recordImmediate =
  (histogram: Histogram) =>
  (metric: WebVitalsMetric): void => {
    if (recordedIds.has(metric.id)) {
      return;
    }

    recordedIds.add(metric.id);
    record(histogram, metric.value, webVitalsAttributes(metric));
  };

/**
 * Keep the latest value; record once the page hides, to avoid multi-report bias.
 *
 * CLS may re-report a *higher* value under the same id after a hide → show →
 * hide cycle. Once flushed, `recordedIds` pins the first hidden-time value: a
 * histogram sample cannot be retracted, so first-wins is the only consistent
 * choice.
 */
const recordDeferred =
  (histogram: Histogram) =>
  (metric: WebVitalsMetric): void => {
    if (recordedIds.has(metric.id)) {
      return;
    }

    pending.set(metric.id, {
      attributes: webVitalsAttributes(metric),
      histogram,
      value: metric.value,
    });
  };

const flushIfHidden = (): void => {
  if (document.visibilityState === "hidden") {
    flushPending();
  }
};

let started = false;

/** Register web-vitals → Effect metrics once per page load. Safe to call repeatedly. */
export const reportWebVitals = (): void => {
  if (started) {
    return;
  }

  started = true;

  onLCP(recordImmediate(webVitalsHistograms.lcp));
  onFCP(recordImmediate(webVitalsHistograms.fcp));
  onTTFB(recordImmediate(webVitalsHistograms.ttfb));
  onCLS(recordDeferred(webVitalsHistograms.cls));
  onINP(recordDeferred(webVitalsHistograms.inp));

  /**
   * Order matters: web-vitals finalizes CLS/INP/LCP from its own capture-phase
   * `visibilitychange` listener, installed by the `on*` calls above. Registering
   * ours afterwards guarantees `pending` is populated before we flush.
   *
   * `pagehide` is a backup only — it is a strictly later, optional event, and a
   * backgrounded mobile tab is routinely killed without ever firing it.
   */
  document.addEventListener("visibilitychange", flushIfHidden, {
    capture: true,
  });
  globalThis.addEventListener("pagehide", flushPending, { capture: true });
};
