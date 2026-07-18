// oxlint-disable no-throw-literal
import type { Span } from "@opentelemetry/api";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTracer,
  noopTracer,
  recordException,
  recordSpan,
} from "./telemetry";

describe("noopTracer", () => {
  it("startSpan returns a non-recording span", () => {
    const span = noopTracer.startSpan("test");
    expect(span.isRecording()).toBe(false);
    expect(span.spanContext()).toEqual({
      spanId: "",
      traceFlags: 0,
      traceId: "",
    });
  });

  it("startActiveSpan invokes callback with noop span", () => {
    const result = noopTracer.startActiveSpan("name", (span) => {
      expect(span.isRecording()).toBe(false);
      return 42;
    });
    expect(result).toBe(42);
  });
});

describe("getTracer", () => {
  it("returns noopTracer when disabled", () => {
    expect(getTracer({ isEnabled: false })).toBe(noopTracer);
    expect(getTracer()).toBe(noopTracer);
  });

  it("returns provided tracer when enabled", () => {
    const custom = noopTracer;
    expect(getTracer({ isEnabled: true, tracer: custom })).toBe(custom);
  });

  it("falls back to OTEL tracer when enabled without custom tracer", () => {
    const spy = vi.spyOn(trace, "getTracer").mockReturnValue(noopTracer);
    expect(getTracer({ isEnabled: true })).toBe(noopTracer);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("recordSpan", () => {
  const span = {
    setStatus: vi.fn(),
    end: vi.fn(),
    recordException: vi.fn(),
  };

  const tracer = {
    startActiveSpan: vi.fn(
      (
        _name: string,
        _opts: unknown,
        fn: (activeSpan: Span) => Promise<unknown>
      ) => fn(span as unknown as Span)
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets OK status and ends span on success", async () => {
    const result = await recordSpan({
      name: "work",
      tracer: tracer as never,
      attributes: { a: 1 },
      fn: () => Promise.resolve("done"),
    });

    expect(result).toBe("done");
    expect(tracer.startActiveSpan).toHaveBeenCalledWith(
      "work",
      { attributes: { a: 1 } },
      expect.any(Function)
    );
    expect(span.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK });
    expect(span.end).toHaveBeenCalled();
  });

  it("skips ending when endWhenDone is false", async () => {
    await recordSpan({
      name: "work",
      tracer: tracer as never,
      endWhenDone: false,
      fn: async () => {},
    });

    expect(span.setStatus).not.toHaveBeenCalled();
    expect(span.end).not.toHaveBeenCalled();
  });

  it("records exception and rethrows on Error", async () => {
    const error = new Error("fail");
    await expect(
      recordSpan({
        name: "work",
        tracer: tracer as never,
        fn: () => {
          throw error;
        },
      })
    ).rejects.toThrow("fail");

    expect(span.recordException).toHaveBeenCalledWith({
      message: "fail",
      name: "Error",
      stack: error.stack,
    });
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: "fail",
    });
    expect(span.end).toHaveBeenCalled();
  });

  it("sets ERROR status for non-Error throws", async () => {
    await expect(
      recordSpan({
        name: "work",
        tracer: tracer as never,
        fn: () => {
          throw "raw";
        },
      })
    ).rejects.toBe("raw");

    expect(span.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR });
    expect(span.end).toHaveBeenCalled();
  });
});

describe("recordException", () => {
  it("starts a span, records attributes, and ends it", () => {
    const span = {
      setAttributes: vi.fn(),
      recordException: vi.fn(),
      setStatus: vi.fn(),
      end: vi.fn(),
    };
    const tracer = {
      startSpan: vi.fn(() => span),
    };

    recordException({
      name: "boom",
      error: { message: "oops", stack: "stack", code: 1 },
      tracer: tracer as never,
    });

    expect(tracer.startSpan).toHaveBeenCalledWith("boom");
    expect(span.setAttributes).toHaveBeenCalledWith({
      "error.message": "oops",
      "error.stack": "stack",
      "error.code": "1",
    });
    expect(span.recordException).toHaveBeenCalled();
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: "oops",
    });
    expect(span.end).toHaveBeenCalled();
  });
});
