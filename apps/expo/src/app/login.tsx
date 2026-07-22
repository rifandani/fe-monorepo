import { Link } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { H3, Paragraph, YStack } from "tamagui";

import { LoginForm } from "@/auth/components/login-form";
import { useTranslation } from "@/core/providers/i18n/context";

export { BaseErrorBoundary as ErrorBoundary } from "@/core/components/base-error-boundary";
const LoginScreen = () => {
  const { t } = useTranslation();
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <YStack flex={1} px="$3" justify="center">
        <H3 testID="login-welcome-title" verticalAlign="center">
          {t("welcome")}
        </H3>

        <LoginForm />

        <Paragraph testID="login-register-text" text="center" mt="$2">
          {t("noAccount")}{" "}
          <Link
            testID="login-register-text-link"
            href="/register"
            style={{ textDecorationLine: "underline" }}
          >
            {t("registerHere")}
          </Link>
        </Paragraph>
      </YStack>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;
