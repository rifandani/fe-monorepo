/* oxlint-disable promise/prefer-await-to-callbacks react-doctor/query-mutation-missing-invalidation */
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authLoginMutationOptions } from "@workspace/core/auth/queries";
import type { AuthLoginError } from "@workspace/core/auth/queries";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { toErrorMessage } from "@workspace/core/utils/error";
import { toast } from "sonner";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/layers/runtime";

/** The login mutation of core, plus this app's error toast. */
export const useAuthLogin = (
  mutationOptions?: Except<
    UseMutationOptions<
      AuthLoginResponseSchema,
      AuthLoginError,
      AuthLoginRequestSchema
    >,
    "mutationKey" | "mutationFn"
  >
) => {
  const { onError, ..._mutationOptions } = mutationOptions ?? {};

  return useMutation({
    ...authLoginMutationOptions(appRuntime),
    onError: (error, variables, onMutateResult, context) => {
      toast.error(toErrorMessage(error));
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
