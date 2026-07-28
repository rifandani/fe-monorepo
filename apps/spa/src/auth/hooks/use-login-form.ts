import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { authLoginRequestSchema } from "@workspace/core/apis/auth";

import { useAuthLogin } from "@/auth/hooks/use-auth-login";
import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";

/**
 * Login form state plus the mutation submitting it, which stores the user and
 * navigates home on success.
 */
export const useLoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthUserStore();
  const loginMutation = useAuthLogin(undefined, {
    onSuccess: async (user) => {
      // set user to local storage and navigate to home
      setUser(user);
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
      onChange: authLoginRequestSchema,
    },
  });
  return { form, loginMutation };
};
