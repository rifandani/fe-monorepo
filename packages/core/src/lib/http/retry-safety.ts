import type { MutationMeta } from "@tanstack/react-query";
import { toErrorMessage } from "@workspace/core/utils/error";
import { Cause } from "effect";

export type RetrySafety = "idempotent" | "not-idempotent";

export interface RetrySafetyMeta {
  readonly retrySafety: RetrySafety;
}

export const idempotentMutation = {
  meta: { retrySafety: "idempotent" } satisfies RetrySafetyMeta,
} as const;

export const notIdempotentMutation = {
  meta: { retrySafety: "not-idempotent" } satisfies RetrySafetyMeta,
  retry: 0,
} as const;

export const unknownOutcomeMessage =
  "The server did not answer in time. The action possibly completed. Check the result before you try again.";

const isNotIdempotent = (meta: MutationMeta | undefined) =>
  meta?.retrySafety === "not-idempotent";

export const isUnknownOutcome = (
  cause: unknown,
  meta: MutationMeta | undefined
): boolean => Cause.isTimeoutError(cause) && isNotIdempotent(meta);

export const toMutationErrorMessage = (
  cause: unknown,
  meta: MutationMeta | undefined
): string =>
  isUnknownOutcome(cause, meta) ? unknownOutcomeMessage : toErrorMessage(cause);
