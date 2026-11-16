import { useForm } from "@tanstack/react-form";
import { authLoginRequestSchema } from "@workspace/core/auth/schemas";
import { Schema } from "effect";

import { useAuthLogin } from "@/features/auth/hooks/use-auth-login";

/** TanStack Form reads any Standard Schema; Effect Schema converts to one. */
const loginValidator = Schema.toStandardSchemaV1(authLoginRequestSchema);

/**
 * Login form state plus the mutation submitting it. The login starts the
 * Session and nothing else: the Session gate of the router leaves the login page.
 */
export const useLoginForm = () => {
  const loginMutation = useAuthLogin();

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
