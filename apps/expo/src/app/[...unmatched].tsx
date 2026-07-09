/* oxlint-disable eslint/func-style -- function declarations */
import { Link, Stack } from "expo-router";
import { H3, YStack } from "tamagui";

import { BaseButton } from "@/core/components/button/base-button";
import { useAppStore } from "@/core/hooks/use-app-store";
import { useTranslation } from "@/core/providers/i18n/context";

export default function Unmatched() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <YStack flex={1} items="center" justify="center" p={5}>
        <H3 className="text-2xl font-bold">{t("notFound")}</H3>

        <Link href={user ? "/" : "/login"} replace asChild>
          <BaseButton mt="$3">
            {t("backTo", { target: user ? "home" : "login" })}
          </BaseButton>
        </Link>
      </YStack>
    </>
  );
}
