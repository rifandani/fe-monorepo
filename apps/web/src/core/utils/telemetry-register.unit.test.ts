import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerOtelTracerAndMeter } from "./telemetry-register";

vi.mock("server-only", () => ({}));

vi.mock("@/core/constants/env", () => ({
  ENV: {
    NEXT_PUBLIC_OTEL_LOG_LEVEL: "INFO",
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
  },
}));

vi.mock("@/core/constants/global", () => ({
  SERVICE_NAME: "web-test",
}));

const registerOTel = vi.hoisted(() => vi.fn());
const OTLPMetricExporter = vi.hoisted(() => vi.fn());
const OTLPTraceExporter = vi.hoisted(() => vi.fn());
const PeriodicExportingMetricReader = vi.hoisted(() => vi.fn());
const BatchSpanProcessor = vi.hoisted(() => vi.fn());
const PgInstrumentation = vi.hoisted(() => vi.fn());

vi.mock("@vercel/otel", () => ({ registerOTel }));
vi.mock("@opentelemetry/exporter-metrics-otlp-http", () => ({
  OTLPMetricExporter,
}));
vi.mock("@opentelemetry/exporter-trace-otlp-http", () => ({
  OTLPTraceExporter,
}));
vi.mock("@opentelemetry/sdk-metrics", () => ({
  PeriodicExportingMetricReader,
}));
vi.mock("@opentelemetry/sdk-trace-base", () => ({ BatchSpanProcessor }));
vi.mock("@opentelemetry/instrumentation-pg", () => ({ PgInstrumentation }));
vi.mock("@opentelemetry/resources", () => ({
  envDetector: "env",
  hostDetector: "host",
  osDetector: "os",
  processDetector: "process",
  serviceInstanceIdDetector: "serviceInstance",
}));

describe("registerOtelTracerAndMeter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OTEL_LOG_LEVEL;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it("bridges public env into process.env and registers OTel", async () => {
    await registerOtelTracerAndMeter();

    expect(process.env.OTEL_LOG_LEVEL).toBe("INFO");
    expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe(
      "http://localhost:4318"
    );
    expect(OTLPTraceExporter).toHaveBeenCalled();
    expect(BatchSpanProcessor).toHaveBeenCalled();
    expect(OTLPMetricExporter).toHaveBeenCalled();
    expect(PeriodicExportingMetricReader).toHaveBeenCalled();
    expect(PgInstrumentation).toHaveBeenCalledWith({
      addSqlCommenterCommentToQueries: true,
      enhancedDatabaseReporting: true,
    });
    expect(registerOTel).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: "web-test",
        propagators: ["tracecontext", "baggage"],
        resourceDetectors: ["env", "host", "os", "serviceInstance", "process"],
      })
    );
  });

  it("does not overwrite existing OTEL process env", async () => {
    process.env.OTEL_LOG_LEVEL = "ERROR";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://custom:4318";

    await registerOtelTracerAndMeter();

    expect(process.env.OTEL_LOG_LEVEL).toBe("ERROR");
    expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe("http://custom:4318");
  });
});
