"use client";

import { useTranslations } from "next-intl";

import { loginAction } from "@/auth/actions/auth";
import { AuthSubmitButton } from "@/auth/components/auth-submit-button.client";
import { AuthTextField } from "@/auth/components/auth-text-field.client";
import { loginFormOpts } from "@/auth/forms/login-form-options";
import { Note } from "@/core/components/ui";
import { useServerForm } from "@/core/hooks/use-server-form";

export const LoginForm = () => {
  const t = useTranslations();
  const { form, formAction, formLevelError, isPending } = useServerForm({
    action: loginAction,
    formOpts: loginFormOpts,
  });
  return (
    <form
      action={formAction}
      className={`
        flex flex-col pt-3
        md:pt-8
      `}
      onSubmit={() => {
        void form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <AuthTextField
            className="group/username pt-4"
            field={field}
            isDisabled={isPending}
            label={t("email")}
            placeholder={t("emailPlaceholder")}
            type="email"
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <AuthTextField
            className="group/password pt-4"
            field={field}
            isDisabled={isPending}
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            type="password"
          />
        )}
      </form.Field>

      {formLevelError && (
        <Note data-testid="mutation-error" intent="danger" className="mt-4">
          {formLevelError}
        </Note>
      )}

      <AuthSubmitButton
        form={form}
        isPending={isPending}
        label={t("login")}
        loadingLabel={t("loginLoading")}
      />
    </form>
  );
};
