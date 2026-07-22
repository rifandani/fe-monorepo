import { H6, YStack } from "tamagui";

import { useTranslation } from "@/core/providers/i18n/context";

export { BaseErrorBoundary as ErrorBoundary } from "@/core/components/base-error-boundary";
const TabsIndexScreen = () => {
  const { t } = useTranslation();
  return (
    <YStack flex={1} p="$3" justify="center">
      <H6>{t("appName")}</H6>
    </YStack>
  );
};
export default TabsIndexScreen;
