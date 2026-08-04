import type { Attributes, Histogram } from "@opentelemetry/api";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

import {
  METRICS_METER_WEB_VITALS,
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/core/constants/global";
import { meterProvider } from "@/instrumentation";

const meter = meterProvider.getMeter(METRICS_METER_WEB_VITALS);
const lcpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_LCP, {
  description: "Largest Contentful Paint",
  unit: "ms",
});
const inpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_INP, {
  description: "Interaction to Next Paint",
  unit: "ms",
});
const clsMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_CLS, {
  description: "Cumulative Layout Shift",
  unit: "1",
});
const fcpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_FCP, {
  description: "First Contentful Paint",
  unit: "ms",
});
const ttfbMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_TTFB, {
  description: "Time to First Byte",
  unit: "ms",
});

interface Pending {
  attributes: Attributes;
  histogram: Histogram;
  value: number;
}

/** Latest sample per metric id (CLS/INP re-report; flushed once when hidden). */
const pending = new Map<string, Pending>();
const recordedIds = new Set<string>();

/** Keys are snake_case per OTEL semconv; `delta` is omitted (unbounded cardinality). */
const attrs = (metric: Metric): Attributes => ({
  navigation_type: metric.navigationType,
  rating: metric.rating,
});

const drainReader = async (): Promise<void> => {
  try {
    await meterProvider.forceFlush();
  } catch {
    // The page is going away, so a failed export is not actionable — but an
    // unhandled rejection here would feed back into global error reporting.
  }
};

/**
 * Export every buffered sample, then drain the reader.
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
    entry.histogram.record(entry.value, entry.attributes);
  }
  pending.clear();
  void drainReader();
};

/** Record immediately; skip if this metric id was already exported. */
const recordImmediate =
  (histogram: Histogram) =>
  (metric: Metric): void => {
    if (recordedIds.has(metric.id)) {
      return;
    }
    recordedIds.add(metric.id);
    histogram.record(metric.value, attrs(metric));
  };

/**
 * Keep the latest value; export once the page hides, to avoid multi-report bias.
 *
 * CLS may re-report a *higher* value under the same id after a hide → show →
 * hide cycle. Once flushed, `recordedIds` pins the first hidden-time value: a
 * histogram sample cannot be retracted, so first-wins is the only consistent
 * choice.
 */
const recordDeferred =
  (histogram: Histogram) =>
  (metric: Metric): void => {
    if (recordedIds.has(metric.id)) {
      return;
    }
    pending.set(metric.id, {
      attributes: attrs(metric),
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

/** Register web-vitals → OTEL once per page load. Safe to call repeatedly. */
export const reportWebVitals = (): void => {
  if (started) {
    return;
  }
  started = true;

  onLCP(recordImmediate(lcpMetric));
  onFCP(recordImmediate(fcpMetric));
  onTTFB(recordImmediate(ttfbMetric));
  onCLS(recordDeferred(clsMetric));
  onINP(recordDeferred(inpMetric));

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
