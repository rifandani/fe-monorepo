import { useToastController } from "@tamagui/toast";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authLoginMutationOptions } from "@workspace/core/auth/queries";
import type { AuthLoginError } from "@workspace/core/auth/queries";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { toMutationErrorMessage } from "@workspace/core/http/retry-safety";
import type { Except } from "type-fest";

import { appRuntime } from "@/lib/layers/runtime";
import type { ToastCustomData } from "@/utils/toast";

export const useAuthLogin = (
  mutationOptions?: Except<
    UseMutationOptions<
      AuthLoginResponseSchema,
      AuthLoginError,
      AuthLoginRequestSchema
    >,
    "mutationKey" | "mutationFn" | "retry" | "meta"
  >
) => {
  const toast = useToastController();
  const { onError, ..._mutationOptions } = mutationOptions ?? {};

  const loginOptions = authLoginMutationOptions(appRuntime);

  return useMutation({
    ...loginOptions,
    onError: (error, variables, onMutateResult, context) => {
      toast.show(toMutationErrorMessage(error, loginOptions.meta), {
        customData: {
          preset: "error",
        } satisfies ToastCustomData,
      });
      onError?.(error, variables, onMutateResult, context);
    },
    ..._mutationOptions,
  });
};
