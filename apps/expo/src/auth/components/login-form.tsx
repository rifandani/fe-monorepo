import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginRequestSchema } from "@workspace/core/apis/auth";
import { useState } from "react";
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
      <Label htmlFor="username" mb="$1">
        {t("username")}
      </Label>
      <Controller
        name="username"
        control={form.control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <Input
              placeholder={t("usernamePlaceholder")}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? (
              <Paragraph testID="login-form-username-error" color="$red10">
                {error.message}
              </Paragraph>
            ) : null}
          </>
        )}
      />

      <Label htmlFor="password" my="$2">
        {t("password")}
      </Label>
      <Controller
        name="password"
        control={form.control}
        rules={{
          minLength: 6,
          required: true,
        }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <Input
              secureTextEntry
              placeholder={t("passwordPlaceholder")}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? (
              <Paragraph testID="login-form-password-error" color="$red10">
                {error.message}
              </Paragraph>
            ) : null}
          </>
        )}
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
