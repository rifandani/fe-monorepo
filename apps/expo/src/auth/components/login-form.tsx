import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginRequestSchema } from "@workspace/core/apis/auth";
import type { ComponentProps } from "react";
import { useState } from "react";
import type { Control, RegisterOptions } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import {
  Checkbox,
  Form,
  Input,
  Label,
  Paragraph,
  Spinner,
  XStack,
} from "tamagui";

import { useAuthLogin } from "@/auth/hooks/use-auth-login";
import { BaseButton } from "@/core/components/button/base-button";
import { useAppStore } from "@/core/hooks/use-app-store";
import { useTranslation } from "@/core/providers/i18n/context";

const RememberMeCheckbox = () => {
  const { t } = useTranslation();
  const [state, setState] = useState({ rememberMe: false });
  return (
    <XStack my="$2" items="center" gap="$2">
      <Checkbox
        id="rememberMe"
        checked={state.rememberMe}
        onCheckedChange={(checked) => {
          setState((prev) => ({ ...prev, rememberMe: !!checked }));
        }}
      >
        <Checkbox.Indicator>
          <Feather name="check" />
        </Checkbox.Indicator>
      </Checkbox>

      <Label htmlFor="rememberMe">{t("rememberMe")}</Label>
    </XStack>
  );
};
interface LoginFormValues {
  password: string;
  username: string;
}

/** One labelled text input of the login form, wired to react-hook-form. */
const LoginTextField = ({
  control,
  name,
  label,
  placeholder,
  labelProps,
  secureTextEntry,
  rules,
}: {
  control: Control<LoginFormValues>;
  name: keyof LoginFormValues;
  label: string;
  placeholder: string;
  labelProps: ComponentProps<typeof Label>;
  secureTextEntry?: boolean;
  rules?: RegisterOptions<LoginFormValues>;
}) => (
  <>
    <Label htmlFor={name} {...labelProps}>
      {label}
    </Label>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <>
          <Input
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
          {error?.message ? (
            <Paragraph testID={`login-form-${name}-error`} color="$red10">
              {error.message}
            </Paragraph>
          ) : null}
        </>
      )}
    />
  </>
);

export const LoginForm = () => {
  const { t } = useTranslation();
  const setUser = useAppStore((state) => state.setUser);
  const form = useForm({
    defaultValues: {
      password: "",
      username: "",
    },
    mode: "onChange",
    resolver: zodResolver(authLoginRequestSchema),
  });
  const loginMutation = useAuthLogin(undefined, {
    onSuccess: (user) => {
      setUser(user);
    },
  });
  return (
    <Form
      onSubmit={form.handleSubmit((values) => {
        loginMutation.mutate(values);
      })}
    >
      <LoginTextField
        control={form.control}
        label={t("username")}
        labelProps={{ mb: "$1" }}
        name="username"
        placeholder={t("usernamePlaceholder")}
      />

      <LoginTextField
        control={form.control}
        label={t("password")}
        labelProps={{ my: "$2" }}
        name="password"
        placeholder={t("passwordPlaceholder")}
        rules={{
          minLength: 6,
          required: true,
        }}
        secureTextEntry
      />

      <RememberMeCheckbox />

      <Form.Trigger asChild>
        <BaseButton
          icon={
            loginMutation.isPending ? (
              <Spinner size="small" />
            ) : (
              <Feather name="log-in" />
            )
          }
          disabled={loginMutation.isPending || !form.formState.isValid}
        >
          {loginMutation.isPending ? t("loginLoading") : t("login")}
        </BaseButton>
      </Form.Trigger>
    </Form>
  );
};
