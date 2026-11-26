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

const otlpEndpoint = import.meta.env.DEV
  ? globalThis.location.origin
  : readEnv(EnvConfig.otelEndpoint);

const logLevelMap = {
  ALL: DiagLogLevel.ALL,
  DEBUG: DiagLogLevel.DEBUG,
  ERROR: DiagLogLevel.ERROR,
  INFO: DiagLogLevel.INFO,
  NONE: DiagLogLevel.NONE,
  VERBOSE: DiagLogLevel.VERBOSE,
  WARN: DiagLogLevel.WARN,
} satisfies Record<(typeof otelLogLevels)[number], DiagLogLevel>;

export const metricReader = new PeriodicExportingMetricReader({
  exportIntervalMillis: 10_000,
  exporter: new OTLPMetricExporter({ url: `${otlpEndpoint}/v1/metrics` }),
});

export const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
);

const browserAttributes = () => ({
  "browser.language": globalThis.navigator?.language ?? "unknown",
  "user_agent.original": globalThis.navigator?.userAgent ?? "unknown",
});

export const TelemetryLive = WebSdk.layer(
  Effect.gen(function* () {
    const logLevel = yield* EnvConfig.otelLogLevel;

    diag.setLogger(new DiagConsoleLogger(), logLevelMap[logLevel]);

    return {
      resource: {
        serviceName: SERVICE_NAME,
        serviceVersion: SERVICE_VERSION,
        attributes: browserAttributes(),
      },
      spanProcessor,
      metricReader,
    };
  })
);
