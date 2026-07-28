import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const flush = vi.fn(async () => {});
  const drain = { flush };
  const createError = vi.fn();
  const log = { error: vi.fn(), info: vi.fn() };
  const identify = vi.fn();
  const createAuthMiddleware = vi.fn(() => identify);
  const createEvlog = vi.fn(() => ({
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
  createOTLPDrain: () => mocks.drain,
}));

vi.mock("evlog/next", () => ({
  createEvlog: mocks.createEvlog,
}));

vi.mock("evlog/better-auth", () => ({
  createAuthMiddleware: mocks.createAuthMiddleware,
}));

vi.mock("evlog/next/instrumentation/create", () => ({
  createInstrumentation: () => ({
    register: mocks.evlogRegister,
    onRequestError: mocks.evlogOnRequestError,
  }),
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
      })
    );
    expect(sut.createError).toBe(mocks.createError);
    expect(sut.log).toBe(mocks.log);
  });

  it("enrich runs every enricher and stamps deployment metadata", async () => {
    vi.stubEnv("VERCEL_DEPLOYMENT_ID", "dpl_1");
    vi.stubEnv("VERCEL_REGION", "sfo1");
    await loadSut();

    const [config] = mocks.createEvlog.mock.calls[0] as unknown as [
      { enrich: (ctx: { event: Record<string, unknown> }) => void },
    ];
    const ctx = { event: {} as Record<string, unknown> };
    config.enrich(ctx);

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
