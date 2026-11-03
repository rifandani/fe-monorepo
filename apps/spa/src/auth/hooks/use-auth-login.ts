/* oxlint-disable promise/prefer-await-to-callbacks react-doctor/query-mutation-missing-invalidation */
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@workspace/core/auth/api";
import { authKeys } from "@workspace/core/auth/queries";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { Effect } from "effect";
import { toast } from "sonner";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/services/runtime";

type Params = Parameters<typeof authKeys.login>[0];

type LoginEffect = ReturnType<typeof authApi.login>;

type Success = Effect.Success<LoginEffect>;

/** Typed by the Effect itself: an `HttpError` or a `SchemaError`. */
type Error = Effect.Error<LoginEffect>;

export const useAuthLogin = (
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, Error, Exclude<Params, undefined>>,
    "mutationKey" | "mutationFn"
  >
) => {
  const { onError, ..._mutationOptions } = mutationOptions ?? {};

  return useMutation<Success, Error, Exclude<Params, undefined>>({
    mutationFn: async (json) =>
      await appRuntime.runPromise(authApi.login(json)),
    mutationKey: authKeys.login(params),
    onError: (error, variables, onMutateResult, context) => {
      toast.error(toErrorMessage(error));
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
