import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { toast } from "sonner";

import { LoginTextField } from "@/auth/components/login-text-field";
import { useLoginForm } from "@/auth/hooks/use-login-form";
import { validateAuthUser } from "@/auth/utils/storage";
import { Button } from "@/core/components/ui/button";
import { Link } from "@/core/components/ui/link";
import { Note } from "@/core/components/ui/note";
import { useSeo } from "@/core/hooks/use-seo";
import { useTranslation } from "@/core/providers/i18n/context";

const LoginForm = () => {
  const { t } = useTranslation();
  const { form, loginMutation } = useLoginForm();
  return (
    <form
      className={`
        flex flex-col pt-3
        md:pt-8
      `}
      onSubmit={(ev) => {
        ev.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="username">
        {(field) => (
          <LoginTextField
            className="group/username pt-4"
            field={field}
            id="username"
            label={t("username")}
            placeholder={t("usernamePlaceholder")}
          />
        )}
      </form.Field>

      {/* password */}
      <form.Field name="password">
        {(field) => (
          <LoginTextField
            className="group/password pt-4"
            field={field}
            id="password"
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            type="password"
          />
        )}
      </form.Field>

      {loginMutation.error && (
        <Note
          data-testid="mutation-error"
          aria-label="Mutation error alert"
          intent="danger"
          className="mt-4"
        >
          {(loginMutation.error as ErrorResponseSchema).message}
        </Note>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-8"
            isDisabled={!canSubmit || isSubmitting}
          >
            {t(isSubmitting ? "loginLoading" : "login")} (emilyspass)
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
const LoginRoute = () => {
  useSeo({
    description:
      "Sign in to your account to access personalized features, manage your profile, and enjoy a seamless experience across our platform.",
    title: "Login",
  });
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen w-full">
      {/* form */}
      <section
        className={`
        flex min-h-screen w-full flex-col justify-center px-10
        md:w-1/2
        xl:px-20
      `}
      >
        <h1 className="text-center text-3xl text-primary">{t("welcome")}</h1>

        <LoginForm />

        <p className="py-12 text-center">
          {t("noAccount")}{" "}
          <Link
            aria-label={t("registerHere")}
            className="hover:underline"
            href="/"
          >
            {t("registerHere")}
          </Link>
        </p>
      </section>

      {/* image */}
      <section
        className={`
        hidden w-1/2 shadow-2xl
        md:block
      `}
      >
        <span
          className={`
          relative h-screen w-full
          md:flex md:items-center md:justify-center
        `}
        >
          <svg
            viewBox="0 0 256 228"
            className="size-60"
            aria-label="Cool React logo"
          >
            <use href="#icon-reactjs" width="100%" height="100%" />
          </svg>
        </span>
      </section>
    </div>
  );
};
export const Route = createFileRoute("/login")({
  beforeLoad: ({ location }) => {
    const authed = validateAuthUser();
    if (authed) {
      // redirect authorized user to login
      toast.info("Already Logged In");
      throw redirect({
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can potentially lag behind the actual current location)
          redirect: location.href,
        },
        to: "/",
      });
    }
  },
  component: LoginRoute,
});
