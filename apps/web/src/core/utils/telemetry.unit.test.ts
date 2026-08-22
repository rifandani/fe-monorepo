// oxlint-disable no-throw-literal
import type { Span, SpanOptions, Tracer } from "@opentelemetry/api";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTracer,
  noopTracer,
  recordException,
  recordSpan,
} from "./telemetry";

// SAFETY: the noop tracer's signature declares these arguments; passing them as
// absent is the behaviour under test, which the types cannot express.
const absentArg: never = undefined as never;

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

  it("passes the noop span to whichever argument is the callback", () => {
    const fn = vi.fn((span: Span) => span.spanContext().traceId);
    expect(noopTracer.startActiveSpan("a", {}, fn)).toBe("");
    expect(noopTracer.startActiveSpan("a", {}, absentArg, fn)).toBe("");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("returns undefined when no callback is supplied", () => {
    expect(
      noopTracer.startActiveSpan("a", {}, absentArg, absentArg)
    ).toBeUndefined();
  });

  it("every noop span method is chainable and side-effect free", () => {
    const span = noopTracer.startSpan("test");

    expect(span.addEvent("e")).toBe(span);
    expect(span.addLink({ context: span.spanContext() })).toBe(span);
    expect(span.addLinks([{ context: span.spanContext() }])).toBe(span);
    expect(span.setAttribute("k", "v")).toBe(span);
    expect(span.setAttributes({ k: "v" })).toBe(span);
    expect(span.setStatus({ code: SpanStatusCode.OK })).toBe(span);
    expect(span.recordException(new Error("x"))).toBe(span);
    expect(span.updateName("renamed")).toBe(span);
    expect(span.end()).toBe(span);
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

  // SAFETY: `recordSpan`/`recordException` touch only the members stubbed here, so
  // the stub covers the whole surface under test; the cast stands in for the rest
  // of otel's `Span` interface.
  const spanStub: Span = span as never;

  const tracer = {
    startActiveSpan: vi.fn(
      <T>(
        _name: string,
        _opts: SpanOptions,
        fn: (activeSpan: Span) => Promise<T>
      ) => fn(spanStub)
    ),
  };
  // SAFETY: as above, for the `Tracer` surface `recordSpan` calls into.
  const tracerStub: Tracer = tracer as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets OK status and ends span on success", async () => {
    const result = await recordSpan({
      name: "work",
      tracer: tracerStub,
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
      tracer: tracerStub,
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
        tracer: tracerStub,
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
        tracer: tracerStub,
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
    // SAFETY: `recordException` calls only `startSpan` and the span members stubbed
    // above; the cast stands in for the rest of otel's `Tracer` interface.
    const tracerStub: Tracer = tracer as never;

    recordException({
      name: "boom",
      error: { message: "oops", stack: "stack", code: 1 },
      tracer: tracerStub,
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
