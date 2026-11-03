import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { errorResponseSchema } from "@workspace/core/http/schemas";
import { Predicate, Schema } from "effect";

const isErrorResponse = Schema.is(errorResponseSchema);

/**
 * A non-JSON error body arrives as text; empty or unparseable arrives absent.
 * A schema rather than a `typeof` check because `anti-slop/no-runtime-typeof`
 * asks for exactly that — parse the shape, do not sniff it.
 */
const isTextBody = Schema.is(Schema.NonEmptyString);

/**
 * @description Shown when the failure says nothing a person can act on.
 */
export const genericErrorMessage = "Something went wrong. Please try again.";

/**
 * @description Derive a message to show a person from any failure.
 *
 * The ladder, in order:
 * 1. the Error Envelope the API returns, when the body carried one;
 * 2. the error body when it is plain text rather than JSON;
 * 3. the error's own message — for an `HttpResponseError` this is
 *    `Request failed with status code 401: POST …`, which is developer-facing
 *    but truthful, and strictly better than saying nothing;
 * 4. a generic message, for a `SchemaError` (the server sent a shape we cannot
 *    read — naming the offending field leaks our internals) or for anything
 *    that is not an `Error` at all.
 *
 * Takes `unknown` on purpose: `onError` and `query.error` carry a declared
 * union that nothing verifies at runtime.
 */
export const toErrorMessage = (error: unknown): string => {
  if (error instanceof HttpResponseError) {
    if (isErrorResponse(error.data)) {
      return error.data.message;
    }

    if (isTextBody(error.data)) {
      return error.data;
    }

    return error.message;
  }

  // A SchemaError is an `Error`, so it must be answered before the general case.
  // Matched by `_tag` rather than `instanceof`: each app resolves its own
  // `effect`, and a second copy would make `instanceof` quietly false — falling
  // through to `error.message`, which is the issue list this branch exists to
  // keep out of a toast.
  if (Predicate.isTagged(error, "SchemaError")) {
    return genericErrorMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return genericErrorMessage;
};
