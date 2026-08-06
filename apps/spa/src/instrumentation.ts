import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  metrics,
} from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { browserDetector } from "@opentelemetry/opentelemetry-browser-detector";
import {
  detectResources,
  resourceFromAttributes,
} from "@opentelemetry/resources";
import {
  AggregationType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import type { ViewOptions } from "@opentelemetry/sdk-metrics";
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { logger } from "@workspace/core/utils/logger";

import { ENV } from "@/core/constants/env";
import {
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
  SERVICE_NAME,
  SERVICE_VERSION,
} from "@/core/constants/global";
// Dev (incl. portless HTTPS): same-origin via Vite proxy → avoids CORS + mixed content.
const otlpEndpoint = import.meta.env.DEV
  ? window.location.origin
  : ENV.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
const TRACE_EXPORTER_URL = `${otlpEndpoint}/v1/traces`;
const METRICS_EXPORTER_URL = `${otlpEndpoint}/v1/metrics`;
const logLevelMap: Record<string, DiagLogLevel> = {
  ALL: DiagLogLevel.ALL,
  DEBUG: DiagLogLevel.DEBUG,
  ERROR: DiagLogLevel.ERROR,
  INFO: DiagLogLevel.INFO, // default
  NONE: DiagLogLevel.NONE,
  VERBOSE: DiagLogLevel.VERBOSE,
  WARN: DiagLogLevel.WARN,
};
// for troubleshooting the internal otel logs, set the log level to DEBUG
diag.setLogger(new DiagConsoleLogger(), logLevelMap[ENV.VITE_OTEL_LOG_LEVEL]);
let resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
});
const detectedResources = detectResources({ detectors: [browserDetector] });
resource = resource.merge(detectedResources);
/**
 * WebTracerProvider already includes:
 * new W3CTraceContextPropagator()
 * new W3CBaggagePropagator()
 */
const tracerProvider = new WebTracerProvider({
  resource,
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: TRACE_EXPORTER_URL,
      })
    ),
    // new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
});
/**
 * Web vitals are judged at p75, so the SDK default buckets
 * ([0, 5, 10, 25, …, 10000]) are unusable here: every non-zero CLS sample would
 * land in the single `(0, 5]` bucket and any percentile would be interpolated
 * out of thin air. Each set below places the metric's Good/Poor thresholds
 * exactly on a bucket edge, so "% of sessions rated good" is an exact count.
 *
 * @see https://web.dev/articles/vitals#core-web-vitals
 */
const histogramView = (
  instrumentName: string,
  boundaries: number[]
): ViewOptions => ({
  aggregation: {
    options: { boundaries },
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
  },
  instrumentName,
});
export const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exportIntervalMillis: 10_000,
      exporter: new OTLPMetricExporter({
        url: METRICS_EXPORTER_URL,
      }),
    }),
    // new PeriodicExportingMetricReader({
    //   exporter: new ConsoleMetricExporter(),
    //   exportIntervalMillis: 5_000,
    // }),
  ],
  resource,
  views: [
    // good ≤ 2500ms, poor > 4000ms
    histogramView(
      METRICS_METER_WEB_VITALS_LCP,
      [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10_000]
    ),
    // good ≤ 200ms, poor > 500ms
    histogramView(
      METRICS_METER_WEB_VITALS_INP,
      [25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 2000]
    ),
    // unitless, good ≤ 0.1, poor > 0.25
    histogramView(
      METRICS_METER_WEB_VITALS_CLS,
      [0.01, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.4, 0.6, 1]
    ),
    // good ≤ 1800ms, poor > 3000ms
    histogramView(
      METRICS_METER_WEB_VITALS_FCP,
      [300, 600, 1000, 1400, 1800, 2200, 3000, 4000, 6000, 10_000]
    ),
    // good ≤ 800ms, poor > 1800ms
    histogramView(
      METRICS_METER_WEB_VITALS_TTFB,
      [100, 200, 400, 600, 800, 1200, 1800, 2500, 4000, 8000]
    ),
  ],
});
tracerProvider.register();
metrics.setGlobalMeterProvider(meterProvider);
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/api\.iconify\.design/u],
    }),
  ],
});
logger.log("[instrumentation]: Client started");
