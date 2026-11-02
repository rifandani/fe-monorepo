import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { authLoginRequestSchema } from "@workspace/core/apis/auth";
import { Schema } from "effect";

import { useAuthLogin } from "@/auth/hooks/use-auth-login";
import { authUserStore } from "@/auth/stores/auth-user-store";

/** TanStack Form reads any Standard Schema; Effect Schema converts to one. */
const loginValidator = Schema.toStandardSchemaV1(authLoginRequestSchema);

/**
 * Login form state plus the mutation submitting it, which stores the user and
 * navigates home on success.
 */
export const useLoginForm = () => {
  const navigate = useNavigate();

  const loginMutation = useAuthLogin(undefined, {
    onSuccess: async (user) => {
      // set user to local storage and navigate to home
      authUserStore.set(user);
      await navigate({ to: "/" });
    },
  });

  const form = useForm({
    defaultValues: {
      password: "",
      username: "",
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
    validators: {
      onChange: loginValidator,
    },
  });

  return { form, loginMutation };
};
