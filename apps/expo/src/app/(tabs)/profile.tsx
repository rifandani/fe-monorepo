/* oxlint-disable eslint/func-style sonarjs/no-wildcard-import -- function declarations; expo-updates namespace API */
import Feather from "@expo/vector-icons/Feather";
import { useToastController } from "@tamagui/toast";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import {
  H6,
  ListItem,
  Paragraph,
  Separator,
  useTheme,
  XStack,
  YStack,
} from "tamagui";

import { BaseButton } from "@/core/components/button/base-button";
import { BLURHASH } from "@/core/constants/global";
import { useAppStore } from "@/core/hooks/use-app-store";
import type { ToastCustomData } from "@/core/providers/toast/the-toast";
import { ProfileLanguageChanger } from "@/user/components/profile-language-changer";
import { ProfileListItem } from "@/user/components/profile-list-item";
import { ProfileThemeChanger } from "@/user/components/profile-theme-changer";
import { useGetUser } from "@/user/hooks/use-get-user";

function EditProfileSection() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const { data } = useGetUser(
    user
      ? {
          id: user.id,
        }
      : undefined
  );

  return (
    <XStack mb="$3" height="$10" gap="$5">
      <Image
        testID="profile-image"
        source={data?.image}
        placeholder={{ blurhash: BLURHASH }}
        transition={1000}
        contentFit="fill"
        style={{ borderRadius: 1000, width: 100 }}
      />

      <YStack flex={1}>
        <H6 size="$4">{data?.username}</H6>
        <Paragraph size="$3">{data?.email}</Paragraph>

        <BaseButton mt="auto" p="$2" width="$11" icon={<Feather name="edit" />}>
          {t("user.editProfile")}
        </BaseButton>
      </YStack>
    </XStack>
  );
}
function CheckForUpdatesListItem() {
  const { show } = useToastController();
  const { t } = useTranslation();
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  useFocusEffect(() => {
    // oxlint-disable-next-line promise/prefer-await-to-then promise/prefer-await-to-callbacks github/no-then
    Updates.checkForUpdateAsync().catch((error) =>
      show(error.message, {
        customData: {
          preset: "error",
        } as ToastCustomData,
      })
    );
  });
  useFocusEffect(() => {
    if (isUpdatePending) {
      // oxlint-disable-next-line promise/prefer-await-to-then promise/prefer-await-to-callbacks github/no-then
      Updates.reloadAsync().catch((error) =>
        show(error.message, {
          customData: {
            preset: "error",
          } as ToastCustomData,
        })
      );
    }
  });
  if (!isUpdateAvailable) {
    return null;
  }
  return (
    <ProfileListItem
      icon={<Feather name="download-cloud" />}
      onPress={() =>
        // oxlint-disable-next-line promise/prefer-await-to-then promise/prefer-await-to-callbacks github/no-then
        Updates.fetchUpdateAsync().catch((error) =>
          show(error.message, {
            customData: {
              preset: "error",
            } as ToastCustomData,
          })
        )
      }
    >
      <ListItem.Text>{t("user.newUpdateAvailable")}</ListItem.Text>
      <ListItem.Subtitle>
        {t("user.downloadAndInstallUpdate")}
      </ListItem.Subtitle>
    </ProfileListItem>
  );
}
function LogoutListItem() {
  const theme = useTheme();
  const { t } = useTranslation();
  const resetUser = useAppStore((state) => state.resetUser);
  const $red10 = theme?.red10?.get() || "";
  return (
    <ProfileListItem
      pressStyle={{
        bg: "$red2",
        radiused: true,
      }}
      icon={<Feather name="log-out" color={$red10} />}
      iconAfter={<Feather name="chevron-right" color={$red10} />}
      onPress={() => {
        resetUser();
      }}
    >
      <ListItem.Text color="$red10">{t("common.logout")}</ListItem.Text>
    </ProfileListItem>
  );
}
export { BaseErrorBoundary as ErrorBoundary } from "@/core/components/base-error-boundary";
export default function TabsProfileScreen() {
  return (
    <YStack flex={1} p="$3" pt={Platform.select({ android: "$6", ios: "$9" })}>
      <EditProfileSection />
      <ProfileThemeChanger />
      <ProfileLanguageChanger />

      <Separator my="$2" />

      <CheckForUpdatesListItem />
      <LogoutListItem />
      <Paragraph mt="auto" size="$2" text="center">
        {"Version "}
        {nativeApplicationVersion}
        {" Build "}
        {nativeBuildVersion}
      </Paragraph>
    </YStack>
  );
}
