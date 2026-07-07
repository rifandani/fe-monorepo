/* oxlint-disable eslint/func-style -- function declarations */
import { useTranslation } from "react-i18next";
import { H6, YStack } from "tamagui";

export { BaseErrorBoundary as ErrorBoundary } from "@/core/components/base-error-boundary";
export default function TabsIndexScreen() {
  const { t } = useTranslation();
  return (
    <YStack flex={1} p="$3" justify="center">
      <H6>{t("home.title")}</H6>
    </YStack>
  );
}
