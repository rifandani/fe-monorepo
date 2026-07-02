import type { DrainContext } from "evlog";
import type { BetterAuthInstance } from "evlog/better-auth";
import { createAuthMiddleware } from "evlog/better-auth";
import {
  createRequestSizeEnricher,
  createTraceContextEnricher,
  createUserAgentEnricher,
} from "evlog/enrichers";
import { createEvlog } from "evlog/next";
import { createInstrumentation } from "evlog/next/instrumentation/create";
import { createOTLPDrain } from "evlog/otlp";
import { createDrainPipeline } from "evlog/pipeline";

import { auth } from "@/auth/utils/auth";
import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";
import { registerOtelTracerAndMeter } from "@/core/utils/telemetry-register";
import "server-only";
// 1. Enrichers - add derived context to every event
const enrichers = [
  createUserAgentEnricher(),
  createRequestSizeEnricher(),
  createTraceContextEnricher(),
];
// 2. Pipeline - batch events before sending (ref: https://www.evlog.dev/adapters/building-blocks/pipeline)
const pipeline = createDrainPipeline<DrainContext>();
// 3. Drain - OTLP (same adapter factory as browser; see `EvlogBrowserOtlpDrain`)
const drain = pipeline(
  createOTLPDrain({
    endpoint: ENV.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
    serviceName: SERVICE_NAME,
  })
);
export const { withEvlog, useLogger, createError, log } = createEvlog({
  drain,
  enrich: (ctx) => {
    for (const enricher of enrichers) {
      enricher(ctx);
    }
    ctx.event.deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
    ctx.event.region = process.env.VERCEL_REGION;
  },
  routes: {
    "/api/auth/**": { service: "auth-service" },
  },
  sampling: {
    keep: [
      // Always keep errors
      { status: 400 },
      // Always keep slow requests
      { duration: 1000 },
      // { path: '/api/critical/**' }, // Always keep critical paths
    ],
    rates: { info: 10 },
  },
  service: SERVICE_NAME,
});
// ------------------------------------------------------------
// Better Auth Middleware
// ------------------------------------------------------------
export const identify = createAuthMiddleware(auth as BetterAuthInstance, {
  exclude: ["/api/auth/**", "/api/public/**", "/api/health"],
  include: ["/api/**"],
  // extend: (session) => ({
  //   organization: session.user.activeOrganization,
  //   role: session.user.role,
  // }),
});
// ------------------------------------------------------------
// Instrumentation
// ------------------------------------------------------------
export const { register: evlogRegister, onRequestError: evlogOnRequestError } =
  createInstrumentation({
    captureOutput: true,
    drain,
    service: SERVICE_NAME,
  });
// Flush before shutdown (e.g. from your custom server or a teardown hook)
export const flushEvlog = () => drain.flush();
export const register = async () => {
  await evlogRegister();
  // e.g. OpenTelemetry, feature flags, custom one-off init
  await registerOtelTracerAndMeter();
};
export const onRequestError = async (
  error: {
    digest?: string;
  } & Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
  }
) => {
  await evlogOnRequestError(error, request, context);
  // optional: your own side effects (metrics, etc.)
};
