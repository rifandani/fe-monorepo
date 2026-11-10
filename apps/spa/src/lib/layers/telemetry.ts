// Subpath import: the package barrel omits `WebSdk` and `NodeSdk` so a browser
// bundle never pulls the Node SDK.
import * as WebSdk from "@effect/opentelemetry/WebSdk";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { Effect } from "effect";

import { EnvConfig, readEnv } from "@/lib/layers/env";
import type { otelLogLevels } from "@/lib/layers/env";
import { SERVICE_NAME, SERVICE_VERSION } from "@/shared/constants/global";

// Dev (incl. portless HTTPS): same-origin via Vite proxy → avoids CORS + mixed content.
const otlpEndpoint = import.meta.env.DEV
  ? globalThis.location.origin
  : readEnv(EnvConfig.otelEndpoint);

const logLevelMap = {
  ALL: DiagLogLevel.ALL,
  DEBUG: DiagLogLevel.DEBUG,
  ERROR: DiagLogLevel.ERROR,
  INFO: DiagLogLevel.INFO, // default
  NONE: DiagLogLevel.NONE,
  VERBOSE: DiagLogLevel.VERBOSE,
  WARN: DiagLogLevel.WARN,
} satisfies Record<(typeof otelLogLevels)[number], DiagLogLevel>;

/**
 * @description The metric reader the web-vitals module drains when the page
 * hides. Module-scoped so that module can reach it without a running Effect.
 *
 * Bucket boundaries no longer live here as SDK views: each Effect histogram
 * carries its own (see `core/utils/web-vitals.ts`), and `@effect/opentelemetry`
 * exports them as they are.
 */
export const metricReader = new PeriodicExportingMetricReader({
  exportIntervalMillis: 10_000,
  exporter: new OTLPMetricExporter({ url: `${otlpEndpoint}/v1/metrics` }),
});

/**
 * Browser facts the OpenTelemetry browser detector used to add. Read once, and
 * only the ones with bounded cardinality.
 */
const browserAttributes = () => ({
  "browser.language": globalThis.navigator?.language ?? "unknown",
  "user_agent.original": globalThis.navigator?.userAgent ?? "unknown",
});

/**
 * @description Browser telemetry for every Effect run through `appRuntime`:
 * spans (including one per `HttpClient` request) and Effect metrics, exported
 * over OTLP/HTTP by `@effect/opentelemetry`'s `WebSdk`.
 *
 * `WebSdk` builds a `WebTracerProvider` with no Node APIs, so this stays a pure
 * SPA concern — no server, no Node SDK.
 */
export const TelemetryLive = WebSdk.layer(
  Effect.gen(function* () {
    const logLevel = yield* EnvConfig.otelLogLevel;

    // for troubleshooting the internal otel logs, set the log level to DEBUG
    diag.setLogger(new DiagConsoleLogger(), logLevelMap[logLevel]);

    return {
      resource: {
        serviceName: SERVICE_NAME,
        serviceVersion: SERVICE_VERSION,
        attributes: browserAttributes(),
      },
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
      ),
      metricReader,
    };
  })
);
