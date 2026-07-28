// oxlint-disable promise/prefer-await-to-callbacks
/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import { useToastController } from "@tamagui/toast";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { errorResponseSchema } from "@workspace/core/apis/core";
import type { TimeoutError } from "ky";
import { HTTPError } from "ky";
import { match, P } from "ts-pattern";
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
      const message = match(error)
        .with(P.instanceOf(HTTPError), (err) => {
          const parsed = errorResponseSchema.safeParse(err.data);
          return parsed.success ? parsed.data.message : err.message;
        })
        .otherwise((err) => err.message);
      toast.show(message, {
        customData: {
          preset: "error",
        } as ToastCustomData,
      });
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
