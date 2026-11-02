// oxlint-disable promise/prefer-await-to-callbacks
/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import { useToastController } from "@tamagui/toast";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { Effect } from "effect";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/services/runtime";
import type { ToastCustomData } from "@/core/utils/toast";

type Params = Parameters<typeof authKeys.login>[0];

type LoginEffect = ReturnType<typeof authRepositories.login>;

type Success = Effect.Success<LoginEffect>;

/** Typed by the Effect itself: an `HttpError` or a `SchemaError`. */
type MutationError = Effect.Error<LoginEffect>;

export const useAuthLogin = (
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, MutationError, Exclude<Params, undefined>>,
    "mutationKey" | "mutationFn"
  >
) => {
  const toast = useToastController();
  const { onError, ..._mutationOptions } = mutationOptions ?? {};

  return useMutation<Success, MutationError, Exclude<Params, undefined>>({
    mutationFn: (json) => appRuntime.runPromise(authRepositories.login(json)),
    mutationKey: authKeys.login(params),
    onError: (error, variables, onMutateResult, context) => {
      toast.show(toErrorMessage(error), {
        customData: {
          preset: "error",
        } satisfies ToastCustomData,
      });
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
