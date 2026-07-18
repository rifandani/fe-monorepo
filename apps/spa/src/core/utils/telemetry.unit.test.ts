// oxlint-disable no-throw-literal
import type { Span, Tracer } from "@opentelemetry/api";
import type * as OtelApi from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SERVICE_NAME } from "@/core/constants/global";

import {
  getTracer,
  noopTracer,
  recordException,
  recordSpan,
} from "./telemetry";

const { getTracerMock } = vi.hoisted(() => ({
  getTracerMock: vi.fn(),
}));

vi.mock("@opentelemetry/api", async (importOriginal) => {
  const actual = await importOriginal<typeof OtelApi>();
  return {
    ...actual,
    trace: {
      ...actual.trace,
      getTracer: getTracerMock,
    },
  };
});

const createMockSpan = (): Span => ({
  addEvent: vi.fn().mockReturnThis(),
  addLink: vi.fn().mockReturnThis(),
  addLinks: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
  isRecording: vi.fn().mockReturnValue(true),
  recordException: vi.fn().mockReturnThis(),
  setAttribute: vi.fn().mockReturnThis(),
  setAttributes: vi.fn().mockReturnThis(),
  setStatus: vi.fn().mockReturnThis(),
  spanContext: vi.fn().mockReturnValue({
    spanId: "span",
    traceFlags: 1,
    traceId: "trace",
  }),
  updateName: vi.fn().mockReturnThis(),
});

const createMockTracer = (span: Span = createMockSpan()): Tracer =>
  ({
    startActiveSpan: vi.fn(
      (_name: string, _opts: unknown, fn: (span: Span) => unknown): unknown =>
        fn(span)
    ),
    startSpan: vi.fn().mockReturnValue(span),
  }) as unknown as Tracer;

describe("noopTracer", () => {
  it("returns a non-recording span from startSpan", () => {
    const span = noopTracer.startSpan("noop");
    expect(span.isRecording()).toBe(false);
    expect(span.spanContext()).toEqual({
      spanId: "",
      traceFlags: 0,
      traceId: "",
    });
  });

  it("invokes the callback with a noop span for each overload", () => {
    const fn = vi.fn((span: Span) => span.isRecording());
    expect(noopTracer.startActiveSpan("a", fn)).toBe(false);
    expect(noopTracer.startActiveSpan("a", {}, fn)).toBe(false);
    expect(noopTracer.startActiveSpan("a", {}, undefined as never, fn)).toBe(
      false
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe("getTracer", () => {
  beforeEach(() => {
    getTracerMock.mockReset();
  });

  it("returns noopTracer when disabled", () => {
    expect(getTracer({ isEnabled: false })).toBe(noopTracer);
    expect(getTracer()).toBe(noopTracer);
  });

  it("returns the provided tracer when enabled", () => {
    const tracer = createMockTracer();
    expect(getTracer({ isEnabled: true, tracer })).toBe(tracer);
    expect(getTracerMock).not.toHaveBeenCalled();
  });

  it("falls back to trace.getTracer when enabled without a tracer", () => {
    const tracer = createMockTracer();
    getTracerMock.mockReturnValue(tracer);
    expect(getTracer({ isEnabled: true })).toBe(tracer);
    expect(getTracerMock).toHaveBeenCalledWith(SERVICE_NAME);
  });
});

describe("recordSpan", () => {
  it("sets OK status and ends the span on success", async () => {
    const span = createMockSpan();
    const tracer = createMockTracer(span);

    await expect(
      recordSpan({
        name: "work",
        tracer,
        attributes: { "http.method": "GET" },
        fn: () => Promise.resolve("ok"),
      })
    ).resolves.toBe("ok");

    expect(tracer.startActiveSpan).toHaveBeenCalledWith(
      "work",
      { attributes: { "http.method": "GET" } },
      expect.any(Function)
    );
    expect(span.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK });
    expect(span.end).toHaveBeenCalledOnce();
  });

  it("does not end the span when endWhenDone is false", async () => {
    const span = createMockSpan();
    const tracer = createMockTracer(span);

    await recordSpan({
      name: "work",
      tracer,
      attributes: {},
      endWhenDone: false,
      fn: async () => {},
    });

    expect(span.setStatus).not.toHaveBeenCalled();
    expect(span.end).not.toHaveBeenCalled();
  });

  it("records Error exceptions, ends the span, and rethrows", async () => {
    const span = createMockSpan();
    const tracer = createMockTracer(span);
    const error = new Error("boom");

    await expect(
      recordSpan({
        name: "work",
        tracer,
        attributes: {},
        fn: () => {
          throw error;
        },
      })
    ).rejects.toThrow(error);

    expect(span.recordException).toHaveBeenCalledWith({
      message: "boom",
      name: "Error",
      stack: error.stack,
    });
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: "boom",
    });
    expect(span.end).toHaveBeenCalledOnce();
  });

  it("sets ERROR status without recordException for non-Error throws", async () => {
    const span = createMockSpan();
    const tracer = createMockTracer(span);

    await expect(
      recordSpan({
        name: "work",
        tracer,
        attributes: {},
        fn: () => {
          throw "nope";
        },
      })
    ).rejects.toBe("nope");

    expect(span.recordException).not.toHaveBeenCalled();
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
    });
    expect(span.end).toHaveBeenCalledOnce();
  });
});

describe("recordException", () => {
  it("starts a span, records error attributes, and ends it", () => {
    const span = createMockSpan();
    const tracer = createMockTracer(span);

    recordException({
      name: "caught",
      tracer,
      error: { message: "failed", stack: "stack", code: 42 },
    });

    expect(tracer.startSpan).toHaveBeenCalledWith("caught");
    expect(span.setAttributes).toHaveBeenCalledWith({
      "error.message": "failed",
      "error.stack": "stack",
      "error.code": "42",
    });
    expect(span.recordException).toHaveBeenCalledWith({
      message: "failed",
      stack: "stack",
      code: 42,
    });
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: "failed",
    });
    expect(span.end).toHaveBeenCalledOnce();
  });
});
