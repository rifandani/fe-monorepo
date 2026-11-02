import { Effect } from "effect";

/** Value of an extra field recorded next to an error; each is stringified. */
type ErrorAttributeValue = boolean | null | number | string | undefined;

/**
 * @description What gets recorded about one failure: the message, the stack when
 * there is one, and any extra fields (React's `componentStack`, the router's
 * error info) — each becomes an `error.<key>` span attribute.
 */
export interface ReportedError {
  message: string;
  stack?: string;
  [key: string]: ErrorAttributeValue;
}

/**
 * @description Normalize a thrown value — which may be anything — into a
 * `ReportedError`. A thrown non-`Error` carries no stack, so only its string
 * form survives.
 */
export const toReportedError = (
  thrown: unknown,
  extra: Record<string, ErrorAttributeValue> = {}
): ReportedError => ({
  ...extra,
  message: thrown instanceof Error ? thrown.message : String(thrown),
  name: thrown instanceof Error ? thrown.name : undefined,
  stack: thrown instanceof Error ? thrown.stack : undefined,
});

const errorAttributes = (error: ReportedError) =>
  Object.fromEntries(
    Object.entries(error).map(([key, value]) => [`error.${key}`, String(value)])
  );

/**
 * @description An Effect that records `error` as one failed span named `name`.
 *
 * The span fails with a defect carrying the original message and stack, so the
 * tracer marks it ERROR and records the exception; the Effect itself always
 * succeeds — reporting a failure must never become one.
 *
 * @example
 *
 * ```ts
 * appRuntime.runFork(recordException("router.onError", toReportedError(error)));
 * ```
 */
export const recordException = (name: string, error: ReportedError) => {
  const defect = Object.assign(new Error(error.message), {
    stack: error.stack,
  });

  return Effect.die(defect).pipe(
    Effect.withSpan(name, { attributes: errorAttributes(error) }),
    Effect.exit,
    Effect.asVoid
  );
};
