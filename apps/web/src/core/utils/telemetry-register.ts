import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";
import "server-only";

/**
 * OTLP SDK reads `OTEL_*` process env; bridge from the public app env when unset.
 */
const bridgeOtelEnv = () => {
  // NodeSDK will automatically configure the logger based on this env var
  if (!process.env.OTEL_LOG_LEVEL?.trim()) {
    process.env.OTEL_LOG_LEVEL = ENV.NEXT_PUBLIC_OTEL_LOG_LEVEL;
  }
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
      ENV.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;
  }
};

export const registerOtelTracerAndMeter = async () => {
  // we import dynamically because this function could run on edge runtime, and running on edge runtime will not work
  const [
    { OTLPMetricExporter },
    { OTLPTraceExporter },
    {
      envDetector,
      hostDetector,
      osDetector,
      processDetector,
      serviceInstanceIdDetector,
    },
    { PeriodicExportingMetricReader },
    { BatchSpanProcessor },
    { registerOTel },
    { PgInstrumentation },
  ] = await Promise.all([
    import("@opentelemetry/exporter-metrics-otlp-http"),
    import("@opentelemetry/exporter-trace-otlp-http"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/sdk-metrics"),
    import("@opentelemetry/sdk-trace-base"),
    import("@vercel/otel"),
    import("@opentelemetry/instrumentation-pg"),
  ]);
  bridgeOtelEnv();
  registerOTel({
    serviceName: SERVICE_NAME,
    // Default "auto" adds OTLPHttpJsonTraceExporter + vercel-runtime propagator; both need Vercel's
    // request telemetry (missing under next dev). Use standard Node OTLP + W3C propagators only.
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    propagators: ["tracecontext", "baggage"],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
      }),
    ],
    // log records are already handled by evlog, so no logRecordProcessors here
    resourceDetectors: [
      envDetector,
      hostDetector,
      osDetector,
      serviceInstanceIdDetector,
      processDetector,
    ],
    // dns/fs/net/runtime-node/undici instrumentations are intentionally omitted: too verbose.
    // http instrumentation is omitted too — incoming requests are already traced by Next.js,
    // and enabling both causes "ended Span" / "end() once" errors on the same request.
    instrumentations: [
      new PgInstrumentation({
        addSqlCommenterCommentToQueries: true,
        enhancedDatabaseReporting: true,
      }),
    ],
  });
};
