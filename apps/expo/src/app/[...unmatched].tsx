import { useAtomValue } from "@effect/atom-react";
import { Link, Stack } from "expo-router";
import { H3, YStack } from "tamagui";

import { BaseButton } from "@/core/components/button/base-button";
import { useTranslation } from "@/core/providers/i18n/context";
import { userAtom } from "@/core/stores/app-store";

const Unmatched = () => {
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);

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
};

export default Unmatched;
