import type { Attributes, Span, SpanContext, Tracer } from '@opentelemetry/api'
import { context, SpanStatusCode, trace } from '@opentelemetry/api'
import { SERVICE_NAME } from '@/core/constants/global'

const noopSpanContext: SpanContext = {
  traceId: '',
  spanId: '',
  traceFlags: 0,
}

const noopSpan: Span = {
  spanContext() {
    return noopSpanContext
  },
  setAttribute() {
    return this
  },
  setAttributes() {
    return this
  },
  addEvent() {
    return this
  },
  addLink() {
    return this
  },
  addLinks() {
    return this
  },
  setStatus() {
    return this
  },
  updateName() {
    return this
  },
  end() {
    return this
  },
  isRecording() {
    return false
  },
  recordException() {
    return this
  },
}

/**
 * Tracer implementation that does nothing (null object).
 */
export const noopTracer: Tracer = {
  startSpan(): Span {
    return noopSpan
  },

  startActiveSpan<F extends (span: Span) => unknown>(
    _: unknown,
    arg1: unknown,
    arg2?: unknown,
    arg3?: F,
    // biome-ignore lint/suspicious/noExplicitAny: xxx
  ): ReturnType<any> {
    if (typeof arg1 === 'function') {
      return arg1(noopSpan)
    }
    if (typeof arg2 === 'function') {
      return arg2(noopSpan)
    }
    if (typeof arg3 === 'function') {
      return arg3(noopSpan)
    }
  },
}

/**
 * Get a tracer instance.
 *
 * @example
 * ```typescript
 * const tracer = getTracer({
 *   isEnabled: true,
 *   tracer: trace.getTracer('ai'),
 * });
 * ```
 */
export function getTracer({
  isEnabled = false,
  tracer,
}: {
  isEnabled?: boolean
  tracer?: Tracer
} = {}): Tracer {
  if (!isEnabled) {
    return noopTracer
  }

  if (tracer) {
    return tracer
  }

  return trace.getTracer(SERVICE_NAME)
}

/**
 * Wraps a function with a tracer span.
 *
 * @example
 * ```typescript
 * return recordSpan({
 *   name: 'my-function',
 *   tracer: trace.getTracer('ai'),
 *   attributes: { key: 'value' },
 *   fn: async (span) => {
 *     return 'hello';
 *   },
 *   endWhenDone: false,
 * });
 * ```
 */
export function recordSpan<T>({
  name,
  tracer,
  attributes,
  fn,
  endWhenDone = true,
}: {
  /**
   * The name of the span.
   */
  name: string
  /**
   * The tracer to use.
   */
  tracer: Tracer
  /**
   * The attributes to set on the span.
   */
  attributes: Attributes
  /**
   * The function to wrap.
   */
  fn: (span: Span) => Promise<T>
  /**
   * Whether to end the span when the function is done.
   *
   * @default true
   */
  endWhenDone?: boolean
}) {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn(span)

      if (endWhenDone) {
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
      }

      return result
    }
    catch (error) {
      try {
        if (error instanceof Error) {
          span.recordException({
            name: error.name,
            message: error.message,
            stack: error.stack,
          })
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          })
        }
        else {
          span.setStatus({ code: SpanStatusCode.ERROR })
        }
      }
      finally {
        // always stop the span when there is an error:
        span.end()
      }

      throw error
    }
  })
}

/**
 * Record an exception.
 *
 * @example
 * ```typescript
 * recordException({
 *   name: 'my-function',
 *   error: new Error('error message'),
 *   tracer: trace.getTracer('my-tracer'),
 * });
 * ```
 */
export function recordException({
  name,
  error,
  tracer,
}: {
  /**
   * the name of the span
   */
  name: string
  /**
   * the error to record
   */
  error: {
    message: string
    stack?: string
    [key: string]: unknown
    [key: number]: unknown
    [key: symbol]: unknown
  }
  /**
   * the tracer
   */
  tracer: Tracer
}) {
  const span = tracer.startSpan(name)
  context.with(trace.setSpan(context.active(), span), () => {
    span.setAttributes(
      Object.fromEntries(
        Object.entries(error).map(([key, value]) => [`error.${key}`, String(value)]),
      ),
    )
    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
    span.end()
  })
}
