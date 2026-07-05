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
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
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
import { SERVICE_NAME, SERVICE_VERSION } from "@/core/constants/global";
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
