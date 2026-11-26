import { useMutation } from "@tanstack/react-query";
import { authLoginMutationOptions } from "@workspace/core/auth/queries";
import type { AuthLoginError } from "@workspace/core/auth/queries";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { withRetrySafety } from "@workspace/core/http/retry-safety";
import type { CallerMutationOptions } from "@workspace/core/http/retry-safety";

import { useFailurePresenter } from "@/hooks/use-failure-presenter";
import { appRuntime } from "@/lib/layers/runtime";

export const useAuthLogin = (
  mutationOptions?: CallerMutationOptions<
    AuthLoginResponseSchema,
    AuthLoginError,
    AuthLoginRequestSchema
  >
) => {
  const presenter = useFailurePresenter();

  return useMutation(
    withRetrySafety(
      authLoginMutationOptions(appRuntime),
      mutationOptions,
      presenter
    )
  );
};
