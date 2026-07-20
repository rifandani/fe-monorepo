"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import { useTranslations } from "next-intl";

import { registerAction } from "@/auth/actions/auth";
import { registerFormOpts } from "@/auth/forms/register-form-options";
import {
  Button,
  FieldError,
  Input,
  Label,
  Note,
  TextField,
} from "@/core/components/ui";
import { useServerForm } from "@/core/hooks/use-server-form";
import { fieldErrorMessage } from "@/core/utils/field-error-message";

export function RegisterForm() {
  const t = useTranslations();
  const { form, formAction, formLevelError, isPending } = useServerForm({
    action: registerAction,
    formOpts: registerFormOpts,
  });
  return (
    <form
      action={formAction}
      className="flex flex-col pt-3 md:pt-8"
      onSubmit={() => {
        void form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <TextField
            className="group/name pt-4"
            // Let TanStack Form handle validation instead of the browser.
            validationBehavior="aria"
            isRequired
            name={field.name}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            isInvalid={!field.state.meta.isValid}
            isDisabled={isPending}
          >
            <Label htmlFor={field.name}>{t("name")}</Label>
            <Input
              id={field.name}
              aria-label={t("name")}
              placeholder={t("namePlaceholder")}
              type="text"
            />
            <FieldError>
              {fieldErrorMessage(field.state.meta.errorMap)}
            </FieldError>
          </TextField>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <TextField
            className="group/email pt-4"
            // Let TanStack Form handle validation instead of the browser.
            validationBehavior="aria"
            isRequired
            name={field.name}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            isInvalid={!field.state.meta.isValid}
            isDisabled={isPending}
          >
            <Label htmlFor={field.name}>{t("email")}</Label>
            <Input
              id={field.name}
              aria-label={t("email")}
              placeholder={t("emailPlaceholder")}
              type="email"
            />
            <FieldError>
              {fieldErrorMessage(field.state.meta.errorMap)}
            </FieldError>
          </TextField>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <TextField
            className="group/password pt-4"
            // Let TanStack Form handle validation instead of the browser.
            validationBehavior="aria"
            type="password"
            isRequired
            name={field.name}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            isInvalid={!field.state.meta.isValid}
            isDisabled={isPending}
          >
            <Label htmlFor={field.name}>{t("password")}</Label>
            <Input
              id={field.name}
              aria-label={t("password")}
              placeholder={t("passwordPlaceholder")}
              type="password"
            />
            <FieldError>
              {fieldErrorMessage(field.state.meta.errorMap)}
            </FieldError>
          </TextField>
        )}
      </form.Field>

      {formLevelError && (
        <Note data-testid="mutation-error" intent="danger" className="mt-4">
          {formLevelError}
        </Note>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-8 w-full normal-case"
            isDisabled={isPending || isSubmitting || !canSubmit}
          >
            {isPending || isSubmitting ? t("registerLoading") : t("register")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
