import { useForm } from "@tanstack/react-form";
import { authLoginRequestSchema } from "@workspace/core/auth/schemas";
import { Schema } from "effect";

import { useAuthLogin } from "@/features/auth/hooks/use-auth-login";

const loginValidator = Schema.toStandardSchemaV1(authLoginRequestSchema);

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
