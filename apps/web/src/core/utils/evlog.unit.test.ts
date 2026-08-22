import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** Fields an enricher stamps onto the event it is handed. */
type EvlogEventFields = Record<string, boolean | number | string | undefined>;
interface EvlogContext {
  event: EvlogEventFields;
}
interface EvlogConfig {
  enrich: (ctx: EvlogContext) => void;
}

const mocks = vi.hoisted(() => {
  const flush = vi.fn(async () => {});
  const drain = { flush };
  const createError = vi.fn();
  const log = { error: vi.fn(), info: vi.fn() };
  const identify = vi.fn();
  const createAuthMiddleware = vi.fn(() => identify);
  // Typed on the one field the enrichment test reads back, so the recorded call
  // needs no cast.
  const createEvlog = vi.fn((_config: EvlogConfig) => ({
    withEvlog: vi.fn(),
    useLogger: vi.fn(),
    createError,
    log,
  }));
  const evlogRegister = vi.fn(async () => {});
  const evlogOnRequestError = vi.fn(async () => {});
  const registerOtelTracerAndMeter = vi.fn(async () => {});

  return {
    flush,
    drain,
    createError,
    log,
    identify,
    createAuthMiddleware,
    createEvlog,
    createOTLPDrain: vi.fn(() => drain),
    createInstrumentation: vi.fn(() => ({
      register: evlogRegister,
      onRequestError: evlogOnRequestError,
    })),
    evlogRegister,
    evlogOnRequestError,
    registerOtelTracerAndMeter,
    userAgentEnricher: vi.fn(),
    requestSizeEnricher: vi.fn(),
    traceContextEnricher: vi.fn(),
  };
});

vi.mock("@/core/constants/env", () => ({
  ENV: {
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
  },
}));

vi.mock("@/core/constants/global", () => ({
  SERVICE_NAME: "web-test",
}));

vi.mock("@/auth/utils/auth", () => ({
  auth: { id: "auth-instance" },
}));

vi.mock("@/core/utils/telemetry-register", () => ({
  registerOtelTracerAndMeter: mocks.registerOtelTracerAndMeter,
}));

vi.mock("evlog/enrichers", () => ({
  createUserAgentEnricher: () => mocks.userAgentEnricher,
  createRequestSizeEnricher: () => mocks.requestSizeEnricher,
  createTraceContextEnricher: () => mocks.traceContextEnricher,
}));

vi.mock("evlog/pipeline", () => ({
  createDrainPipeline: () => (drain: { flush: () => Promise<void> }) => ({
    ...drain,
    flush: mocks.flush,
  }),
}));

vi.mock("evlog/otlp", () => ({
  createOTLPDrain: mocks.createOTLPDrain,
}));

vi.mock("evlog/next", () => ({
  createEvlog: mocks.createEvlog,
}));

vi.mock("evlog/better-auth", () => ({
  createAuthMiddleware: mocks.createAuthMiddleware,
}));

vi.mock("evlog/next/instrumentation/create", () => ({
  createInstrumentation: mocks.createInstrumentation,
}));

const loadSut = () => import("./evlog");

describe("evlog wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("exposes createError and log from createEvlog", async () => {
    const sut = await loadSut();

    expect(mocks.createEvlog).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "web-test",
        drain: expect.objectContaining({ flush: mocks.flush }),
        sampling: {
          keep: [{ status: 400 }, { duration: 1000 }],
          rates: { info: 10 },
        },
        routes: {
          "/api/auth/**": { service: "auth-service" },
        },
      })
    );
    expect(sut.createError).toBe(mocks.createError);
    expect(sut.log).toBe(mocks.log);
  });

  it("builds the OTLP drain with the env endpoint and service name", async () => {
    await loadSut();

    expect(mocks.createOTLPDrain).toHaveBeenCalledWith({
      endpoint: "http://localhost:4318",
      serviceName: "web-test",
    });
  });

  it("registers instrumentation with captureOutput and the shared drain", async () => {
    await loadSut();

    expect(mocks.createInstrumentation).toHaveBeenCalledWith({
      captureOutput: true,
      drain: expect.objectContaining({ flush: mocks.flush }),
      service: "web-test",
    });
  });

  it("enrich runs every enricher and stamps deployment metadata", async () => {
    vi.stubEnv("VERCEL_DEPLOYMENT_ID", "dpl_1");
    vi.stubEnv("VERCEL_REGION", "sfo1");
    await loadSut();

    const config = mocks.createEvlog.mock.calls[0]?.[0];
    const ctx: EvlogContext = { event: {} };
    config?.enrich(ctx);

    expect(mocks.userAgentEnricher).toHaveBeenCalledWith(ctx);
    expect(mocks.requestSizeEnricher).toHaveBeenCalledWith(ctx);
    expect(mocks.traceContextEnricher).toHaveBeenCalledWith(ctx);
    expect(ctx.event.deploymentId).toBe("dpl_1");
    expect(ctx.event.region).toBe("sfo1");
  });

  it("wires identify via createAuthMiddleware", async () => {
    const sut = await loadSut();

    expect(mocks.createAuthMiddleware).toHaveBeenCalledWith(
      { id: "auth-instance" },
      expect.objectContaining({
        exclude: ["/api/auth/**", "/api/public/**", "/api/health"],
        include: ["/api/**"],
      })
    );
    expect(sut.identify).toBe(mocks.identify);
  });

  it("flushEvlog delegates to drain.flush", async () => {
    const sut = await loadSut();
    await sut.flushEvlog();
    expect(mocks.flush).toHaveBeenCalled();
  });

  it("register runs evlog then otel registration", async () => {
    const sut = await loadSut();
    await sut.register();
    expect(mocks.evlogRegister).toHaveBeenCalled();
    expect(mocks.registerOtelTracerAndMeter).toHaveBeenCalled();
  });

  it("onRequestError delegates to evlog handler", async () => {
    const sut = await loadSut();
    const error = Object.assign(new Error("x"), { digest: "d1" });
    const request = { path: "/", method: "GET", headers: {} };
    const context = {
      routerKind: "AppRouter",
      routePath: "/",
      routeType: "render",
      renderSource: "react-server-components",
    };

    await sut.onRequestError(error, request, context);

    expect(mocks.evlogOnRequestError).toHaveBeenCalledWith(
      error,
      request,
      context
    );
  });
});
