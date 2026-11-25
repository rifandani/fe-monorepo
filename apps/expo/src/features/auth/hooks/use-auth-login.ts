import { useToastController } from "@tamagui/toast";
import { useMutation } from "@tanstack/react-query";
import { authLoginMutationOptions } from "@workspace/core/auth/queries";
import type { AuthLoginError } from "@workspace/core/auth/queries";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { withRetrySafety } from "@workspace/core/http/retry-safety";
import type { CallerMutationOptions } from "@workspace/core/http/retry-safety";

import { appRuntime } from "@/lib/layers/runtime";
import type { ToastCustomData } from "@/utils/toast";

export const useAuthLogin = (
  mutationOptions?: CallerMutationOptions<
    AuthLoginResponseSchema,
    AuthLoginError,
    AuthLoginRequestSchema
  >
) => {
  const toast = useToastController();

  return useMutation(
    withRetrySafety(
      authLoginMutationOptions(appRuntime),
      mutationOptions,
      (message) => {
        toast.show(message, {
          customData: {
            preset: "error",
          } satisfies ToastCustomData,
        });
      }
    )
  );
};
