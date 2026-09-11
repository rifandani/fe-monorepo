// oxlint-disable promise/prefer-await-to-callbacks
/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import { useToastController } from "@tamagui/toast";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { HTTPError, TimeoutError } from "ky";
import type { Except } from "type-fest";
import type { z } from "zod";

import { http } from "@/core/services/http";
import type { ToastCustomData } from "@/core/utils/toast";

type Params = Parameters<typeof authKeys.login>[0];
type Success = Awaited<
  ReturnType<ReturnType<typeof authRepositories>["login"]>
>;
type MutationError = HTTPError<ErrorResponseSchema> | TimeoutError | z.ZodError;

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
    mutationFn: (json) => authRepositories(http).login({ json }),
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
