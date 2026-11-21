import { Metric } from "effect";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric as WebVitalsMetric } from "web-vitals";

import { appRuntime } from "@/lib/layers/runtime";
import { metricReader } from "@/lib/layers/telemetry";
import {
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/shared/constants/global";

export const webVitalsHistograms = {
  lcp: Metric.histogram(METRICS_METER_WEB_VITALS_LCP, {
    description: "Largest Contentful Paint (ms)",
    boundaries: [
      500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10_000,
    ],
  }),
  inp: Metric.histogram(METRICS_METER_WEB_VITALS_INP, {
    description: "Interaction to Next Paint (ms)",
    boundaries: [25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 2000],
  }),
  cls: Metric.histogram(METRICS_METER_WEB_VITALS_CLS, {
    description: "Cumulative Layout Shift",
    boundaries: [0.01, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.4, 0.6, 1],
  }),
  fcp: Metric.histogram(METRICS_METER_WEB_VITALS_FCP, {
    description: "First Contentful Paint (ms)",
    boundaries: [300, 600, 1000, 1400, 1800, 2200, 3000, 4000, 6000, 10_000],
  }),
  ttfb: Metric.histogram(METRICS_METER_WEB_VITALS_TTFB, {
    description: "Time to First Byte (ms)",
    boundaries: [100, 200, 400, 600, 800, 1200, 1800, 2500, 4000, 8000],
  }),
} as const;

type Histogram = (typeof webVitalsHistograms)[keyof typeof webVitalsHistograms];

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

const ignoreExportFailureOnHide = (): void => undefined;

const drainReader = async (): Promise<void> => {
  await metricReader.forceFlush().catch(ignoreExportFailureOnHide);
};

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

const recordImmediate =
  (histogram: Histogram) =>
  (metric: WebVitalsMetric): void => {
    if (recordedIds.has(metric.id)) {
      return;
    }

    recordedIds.add(metric.id);
    record(histogram, metric.value, webVitalsAttributes(metric));
  };

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

  document.addEventListener("visibilitychange", flushIfHidden, {
    capture: true,
  });
  globalThis.addEventListener("pagehide", flushPending, { capture: true });
};
