import type {
  DefaultError,
  MutationMeta,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  Failures,
  presentFailure,
  toFailure,
} from "@workspace/core/http/failure";
import type { Failure, FailurePresenter } from "@workspace/core/http/failure";
import { Cause } from "effect";

export type RetrySafety = "idempotent" | "not-idempotent";

export interface RetrySafetyMeta extends Record<string, unknown> {
  readonly retrySafety: RetrySafety;
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: RetrySafetyMeta;
  }
}

export const idempotentMutation = {
  meta: { retrySafety: "idempotent" } satisfies RetrySafetyMeta,
} as const;

export const notIdempotentMutation = {
  meta: { retrySafety: "not-idempotent" } satisfies RetrySafetyMeta,
  retry: 0,
} as const;

const isNotIdempotent = (meta: MutationMeta | undefined) =>
  meta?.retrySafety === "not-idempotent";

export const isUnknownOutcome = (
  cause: unknown,
  meta: MutationMeta | undefined
): boolean => Cause.isTimeoutError(cause) && isNotIdempotent(meta);

export const toMutationFailure = (
  cause: unknown,
  meta: MutationMeta | undefined
): Failure =>
  isUnknownOutcome(cause, meta)
    ? Failures.Expected({ key: "errorUnknownOutcome" })
    : toFailure(cause);

export type CallerMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  "mutationKey" | "mutationFn" | "retry" | "meta"
>;

export const withRetrySafety = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  owned: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  caller:
    | NoInfer<CallerMutationOptions<TData, TError, TVariables, TOnMutateResult>>
    | undefined,
  presenter: FailurePresenter
): UseMutationOptions<TData, TError, TVariables, TOnMutateResult> => {
  const {
    retry: _retry,
    meta: _meta,
    ...callerOptions
  }: UseMutationOptions<TData, TError, TVariables, TOnMutateResult> = caller ??
  {};

  return {
    ...callerOptions,
    ...owned,
    onError: async (error, variables, onMutateResult, context) => {
      presentFailure(toMutationFailure(error, context.meta), presenter);
      await caller?.onError?.(error, variables, onMutateResult, context);
    },
  };
};
