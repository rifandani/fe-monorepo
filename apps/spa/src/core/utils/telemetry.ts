import type { Attributes, Span, SpanContext, Tracer } from "@opentelemetry/api";
import { context, SpanStatusCode, trace } from "@opentelemetry/api";

import { SERVICE_NAME } from "@/core/constants/global";

const noopSpanContext: SpanContext = {
  spanId: "",
  traceFlags: 0,
  traceId: "",
};
const noopSpan: Span = {
  addEvent() {
    return this;
  },
  addLink() {
    return this;
  },
  addLinks() {
    return this;
  },
  end() {
    return this;
  },
  isRecording() {
    return false;
  },
  recordException() {
    return this;
  },
  setAttribute() {
    return this;
  },
  setAttributes() {
    return this;
  },
  setStatus() {
    return this;
  },
  spanContext() {
    return noopSpanContext;
  },
  updateName() {
    return this;
  },
};
/**
 * Tracer implementation that does nothing (null object).
 */
export const noopTracer: Tracer = {
  startActiveSpan<F extends (span: Span) => unknown>(
    _: unknown,
    arg1: unknown,
    arg2?: unknown,
    arg3?: F
    // oxlint-disable-next-line typescript/no-explicit-any -- noop span overload return
  ): ReturnType<any> {
    if (typeof arg1 === "function") {
      return arg1(noopSpan);
    }
    if (typeof arg2 === "function") {
      return arg2(noopSpan);
    }
    if (typeof arg3 === "function") {
      return arg3(noopSpan);
    }
  },
  startSpan(): Span {
    return noopSpan;
  },
};
export const getTracer = ({
  isEnabled = false,
  tracer,
}: {
  isEnabled?: boolean;
  tracer?: Tracer;
} = {}): Tracer => {
  if (!isEnabled) {
    return noopTracer;
  }
  if (tracer) {
    return tracer;
  }
  return trace.getTracer(SERVICE_NAME);
};
export const recordSpan = <T>({
  name,
  tracer,
  attributes,
  fn,
  endWhenDone = true,
}: {
  /**
   * The name of the span.
   */
  name: string;
  /**
   * The tracer to use.
   */
  tracer: Tracer;
  /**
   * The attributes to set on the span.
   */
  attributes: Attributes;
  /**
   * The function to wrap.
   */
  fn: (span: Span) => Promise<T>;
  /**
   * Whether to end the span when the function is done.
   *
   * @default true
   */
  endWhenDone?: boolean;
}) =>
  tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      if (endWhenDone) {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      }
      return result;
    } catch (error) {
      try {
        if (error instanceof Error) {
          span.recordException({
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
        } else {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
      } finally {
        // always stop the span when there is an error:
        span.end();
      }
      throw error;
    }
  });
export const recordException = ({
  name,
  error,
  tracer,
}: {
  /**
   * the name of the span
   */
  name: string;
  /**
   * the error to record
   */
  error: {
    message: string;
    stack?: string;
    [key: string]: unknown;
    [key: number]: unknown;
    [key: symbol]: unknown;
  };
  /**
   * the tracer
   */
  tracer: Tracer;
}) => {
  const span = tracer.startSpan(name);
  context.with(trace.setSpan(context.active(), span), () => {
    span.setAttributes(
      Object.fromEntries(
        Object.entries(error).map(([key, value]) => [
          `error.${key}`,
          String(value),
        ])
      )
    );
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.end();
  });
};
