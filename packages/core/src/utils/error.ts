import { errorResponseSchema } from "@workspace/core/apis/core";
import { HTTPError } from "ky";
import { z } from "zod";

/**
 * A non-JSON error body arrives as text; empty or unparseable arrives absent.
 * A schema rather than a `typeof` check because `anti-slop/no-runtime-typeof`
 * asks for exactly that — parse the shape, do not sniff it.
 */
const textBodySchema = z.string().min(1);

/**
 * @description Shown when the failure says nothing a person can act on.
 */
export const genericErrorMessage = "Something went wrong. Please try again.";

/**
 * @description Derive a message to show a person from any thrown failure.
 *
 * The ladder, in order:
 * 1. the Error Envelope the API returns, when the body carried one;
 * 2. the error body when it is plain text rather than JSON;
 * 3. the error's own message — for an `HTTPError` this is ky's
 *    `Request failed with status code 401: POST …`, which is developer-facing
 *    but truthful, and strictly better than saying nothing;
 * 4. a generic message, for a `ZodError` (the server sent a shape we cannot
 *    read — naming the offending field leaks our internals) or for anything
 *    thrown that is not an `Error` at all.
 *
 * Takes `unknown` on purpose: `onError` and `query.error` carry a declared
 * union that nothing verifies at runtime, and callers that hand-rolled
 * `error instanceof Error ? error.message : String(error)` have no union at all.
 */
export const toErrorMessage = (error: unknown): string => {
  if (error instanceof HTTPError) {
    const parsed = errorResponseSchema.safeParse(error.data);
    if (parsed.success) {
      return parsed.data.message;
    }
    const text = textBodySchema.safeParse(error.data);
    if (text.success) {
      return text.data;
    }
    return error.message;
  }
  // A ZodError is an `Error`, so it must be answered before the general case.
  // Matched by `name`, which zod assigns explicitly, rather than `instanceof`:
  // each app resolves its own zod, and a second copy would make `instanceof`
  // quietly false — falling through to `error.message`, which is the serialised
  // issue list this branch exists to keep out of a toast.
  if (error instanceof Error) {
    return error.name === "ZodError" ? genericErrorMessage : error.message;
  }
  return genericErrorMessage;
};
