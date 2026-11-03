// oxlint-disable promise/prefer-await-to-callbacks
/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import { useToastController } from "@tamagui/toast";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { authLoginMutationOptions } from "@workspace/core/auth/queries";
import type { AuthLoginError } from "@workspace/core/auth/queries";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/layers/runtime";
import type { ToastCustomData } from "@/core/utils/toast";

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
  const toast = useToastController();
  const { onError, ..._mutationOptions } = mutationOptions ?? {};

  return useMutation({
    ...authLoginMutationOptions(appRuntime),
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
