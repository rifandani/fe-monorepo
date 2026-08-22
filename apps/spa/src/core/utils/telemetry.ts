// oxlint-disable promise/prefer-await-to-callbacks
import type {
  Attributes,
  Context,
  Span,
  SpanContext,
  SpanOptions,
  Tracer,
} from "@opentelemetry/api";
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
/** The callback otel hands the active span, in any of the overload positions. */
type SpanCallback<R> = (span: Span) => R;

/**
 * `startActiveSpan` is overloaded on `(name, fn)`, `(name, options, fn)` and
 * `(name, options, context, fn)`, so the callback can arrive in any of three
 * positions. This predicate names that argument.
 */
const isSpanCallback = <R>(
  value: Context | SpanCallback<R> | SpanOptions | undefined
): value is SpanCallback<R> => typeof value === "function";

/** Picks the callback out of whichever overload position it arrived in. */
const resolveSpanCallback = <R>(
  arg1: SpanCallback<R> | SpanOptions,
  arg2?: Context | SpanCallback<R>,
  arg3?: SpanCallback<R>
): SpanCallback<R> | undefined => {
  if (isSpanCallback<R>(arg1)) {
    return arg1;
  }
  if (isSpanCallback<R>(arg2)) {
    return arg2;
  }
  return arg3;
};

/** Value of an extra field recorded next to an error; each is stringified. */
type ErrorAttributeValue = boolean | null | number | string | undefined;

export const noopTracer: Tracer = {
  startActiveSpan<R>(
    _name: string,
    arg1: SpanCallback<R> | SpanOptions,
    arg2?: Context | SpanCallback<R>,
    arg3?: SpanCallback<R>
  ): R {
    const fn = resolveSpanCallback<R>(arg1, arg2, arg3);
    // SAFETY: a noop tracer has nothing to report, so with no callback in any
    // overload position there is no value to produce - which the `R` fixed by
    // otel's own signature cannot express.
    return fn?.(noopSpan) as R;
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
interface RecordSpanOptions<T> {
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
}

/**
 * Marks the span as failed and always ends it. A thrown value that is not an
 * `Error` carries no message or stack to report, so the catch below narrows it to
 * `null` and only the status is set.
 */
const failSpan = (span: Span, error: Error | null) => {
  try {
    if (error) {
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
};

export const recordSpan = <T>({
  name,
  tracer,
  attributes,
  fn,
  endWhenDone = true,
}: RecordSpanOptions<T>) =>
  tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      if (endWhenDone) {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      }
      return result;
    } catch (error) {
      failSpan(span, error instanceof Error ? error : null);
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
    [key: string]: ErrorAttributeValue;
    [key: number]: ErrorAttributeValue;
    [key: symbol]: ErrorAttributeValue;
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
