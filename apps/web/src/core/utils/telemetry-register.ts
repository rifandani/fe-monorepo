/* oxlint-disable eslint/func-style react-doctor/async-parallel react-doctor/server-sequential-independent-await */
import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";
import "server-only";

// const openApiRegex = /^\/openapi(?:\/.*)?$/
// const nextStaticRegex = /^\/_next\/static\/.*/
// const nextSourceMapRegex = /^\/__nextjs_source-map\//
// const nextStackFramesRegex = /^\/__nextjs_original-stack-frames\//
// const wellKnownRegex = /^\/\.well-known\/.*/
// const imageRegex = /\.(?:png|jpg|jpeg|gif|svg|ico|webp)$/i

export async function registerOtelTracerAndMeter() {
  // we import dynamically because this function could run on edge runtime, and running on edge runtime will not work
  // const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http')
  const { OTLPMetricExporter } =
    await import("@opentelemetry/exporter-metrics-otlp-http");
  const { OTLPTraceExporter } =
    await import("@opentelemetry/exporter-trace-otlp-http");
  const {
    envDetector,
    hostDetector,
    osDetector,
    processDetector,
    serviceInstanceIdDetector,
  } = await import("@opentelemetry/resources");
  // const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs')
  const { PeriodicExportingMetricReader } =
    await import("@opentelemetry/sdk-metrics");
  const { BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-base");
  const { registerOTel } = await import("@vercel/otel");
  // const { DnsInstrumentation } = await import('@opentelemetry/instrumentation-dns')
  // const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http')
  // const { NetInstrumentation } = await import('@opentelemetry/instrumentation-net')
  const { PgInstrumentation } =
    await import("@opentelemetry/instrumentation-pg");
  // const { RuntimeNodeInstrumentation } = await import('@opentelemetry/instrumentation-runtime-node')
  // const { UndiciInstrumentation } = await import('@opentelemetry/instrumentation-undici')
  // NodeSDK will automatically configure the logger based on this env var
  if (!process.env.OTEL_LOG_LEVEL?.trim()) {
    process.env.OTEL_LOG_LEVEL = ENV.NEXT_PUBLIC_OTEL_LOG_LEVEL;
  }
  // OTLP SDK reads OTEL_EXPORTER_OTLP_*; bridge from public app env when unset
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
      ENV.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;
  }
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
    // already handled by evlog
    // logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
    resourceDetectors: [
      envDetector,
      hostDetector,
      osDetector,
      serviceInstanceIdDetector,
      processDetector,
    ],
    instrumentations: [
      // new DnsInstrumentation(), too verbose
      // new FsInstrumentation(), too verbose
      // Incoming requests are already traced by Next.js; enabling both causes "ended Span" / "end() once" errors on the same request.
      // new HttpInstrumentation({
      //   ignoreIncomingRequestHook: (request) => {
      //     return (
      //       request.url === '/manifest.webmanifest'
      //       || openApiRegex.test(request.url ?? '')
      //       || nextStaticRegex.test(request.url ?? '')
      //       || nextSourceMapRegex.test(request.url ?? '')
      //       || nextStackFramesRegex.test(request.url ?? '')
      //       || wellKnownRegex.test(request.url ?? '')
      //       || imageRegex.test(request.url ?? '')
      //     )
      //   },
      // }),
      // new NetInstrumentation(), too verbose
      new PgInstrumentation({
        addSqlCommenterCommentToQueries: true,
        enhancedDatabaseReporting: true,
      }),
      // new RuntimeNodeInstrumentation(), too verbose
      // new UndiciInstrumentation(), too verbose
    ],
  });
  /**
   * if @vercel/otel is < v2.0, we need to set the global meter provider manually
   * downsides are, we can't shutdown gracefully this meter provider
   */
  // const meterProvider = new MeterProvider({
  //   resource: resourceFromAttributes({
  //     // Node
  //     'node.ci': process.env.CI ? true : undefined,
  //     'node.env': process.env.NODE_ENV,
  //     // Vercel
  //     // https://vercel.com/docs/projects/environment-variables/system-environment-variables
  //     // Vercel Env set as top level attribute for simplicity. One of 'production', 'preview' or 'development'.
  //     'env': process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV,
  //     'vercel.region': process.env.VERCEL_REGION,
  //     'vercel.runtime': 'nodejs',
  //     'vercel.sha':
  //       process.env.VERCEL_GIT_COMMIT_SHA
  //       || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  //     'vercel.host':
  //       process.env.VERCEL_URL
  //       || process.env.NEXT_PUBLIC_VERCEL_URL
  //       || undefined,
  //     'vercel.branch_host':
  //       process.env.VERCEL_BRANCH_URL
  //       || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL
  //       || undefined,
  //     'vercel.deployment_id': process.env.VERCEL_DEPLOYMENT_ID || undefined,
  //     // custom attributes
  //     [ATTR_SERVICE_NAME]: SERVICE_NAME,
  //     [ATTR_SERVICE_VERSION]:
  //       process.env.VERCEL_DEPLOYMENT_ID || SERVICE_VERSION,
  //   }),
  //   readers: [
  //     new PeriodicExportingMetricReader({
  //       exporter: new OTLPMetricExporter(),
  //     }),
  //   ],
  // })
  // metrics.setGlobalMeterProvider(meterProvider)
}
