/* oxlint-disable sonarjs/no-built-in-override react-doctor/query-mutation-missing-invalidation */
import type { MutationState, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useMutationState } from "@tanstack/react-query";
import type { AuthLoginRequestSchema } from "@workspace/core/apis/auth";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { errorResponseSchema } from "@workspace/core/apis/core";
import type { TimeoutError } from "ky";
import { HTTPError } from "ky";
import { toast } from "sonner";
import type { Except } from "type-fest";
import type { z } from "zod";

import { http } from "@/core/services/http";

type Params = Parameters<typeof authKeys.login>[0];
type Success = Awaited<
  ReturnType<ReturnType<typeof authRepositories>["login"]>
>;
type Error = HTTPError<ErrorResponseSchema> | TimeoutError | z.ZodError;
export const useAuthLogin = (
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, Error, Exclude<Params, undefined>>,
    "mutationKey" | "mutationFn"
  >
) => {
  const { onError, ..._mutationOptions } = mutationOptions ?? {};
  return useMutation<Success, Error, Exclude<Params, undefined>>({
    mutationFn: (json) => authRepositories(http).login({ json }),
    mutationKey: authKeys.login(params),
    onError: (error, variables, onMutateResult, context) => {
      if (error instanceof HTTPError) {
        const parsed = errorResponseSchema.safeParse(error.data);
        toast.error(parsed.success ? parsed.data.message : error.message);
      } else {
        toast.error(error.message);
      }
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
export const useAuthLoginMutationState = (params: AuthLoginRequestSchema) =>
  useMutationState<MutationState<Success, Error, Exclude<Params, undefined>>>({
    filters: {
      mutationKey: authKeys.login(params),
    },
  });
