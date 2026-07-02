import { useToastController } from "@tamagui/toast";
import type { MutationState, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useMutationState } from "@tanstack/react-query";
import type { AuthLoginRequestSchema } from "@workspace/core/apis/auth";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { errorResponseSchema } from "@workspace/core/apis/core";
import type { TimeoutError } from "ky";
import { HTTPError } from "ky";
import type { Except } from "type-fest";
import type { z } from "zod";

import type { ToastCustomData } from "@/core/providers/toast/the-toast";
import { http } from "@/core/services/http";

type Params = Parameters<typeof authKeys.login>[0];
type Success = Awaited<
  ReturnType<ReturnType<typeof authRepositories>["login"]>
>;
type Error = HTTPError<ErrorResponseSchema> | TimeoutError | z.ZodError;
/**
 * POST ${env.apiBaseUrl}/auth/login
 * Includes error handling for convenience.
 */
export const useAuthLogin = (
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, Error, Exclude<Params, undefined>>,
    "mutationKey" | "mutationFn"
  >
) => {
  const toast = useToastController();
  const { onError, ..._mutationOptions } = mutationOptions ?? {};
  return useMutation<Success, Error, Exclude<Params, undefined>>({
    mutationFn: (json) => authRepositories(http).login({ json }),
    mutationKey: authKeys.login(params),
    onError: (error, variables, onMutateResult, context) => {
      let { message } = error;
      if (error instanceof HTTPError) {
        const parsed = errorResponseSchema.safeParse(error.data);
        message = parsed.success ? parsed.data.message : error.message;
      }
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
/**
 * Get mutation state based on the mutation key.
 */
export const useAuthLoginMutationState = (params: AuthLoginRequestSchema) =>
  useMutationState<MutationState<Success, Error, Exclude<Params, undefined>>>({
    filters: {
      mutationKey: authKeys.login(params),
    },
  });
