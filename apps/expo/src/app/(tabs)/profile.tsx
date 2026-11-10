import { useAtomValue } from "@effect/atom-react";
import Feather from "@expo/vector-icons/Feather";
import { useToastController } from "@tamagui/toast";
import { endSession } from "@workspace/core/session/session";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import {
  checkForUpdateAsync,
  reloadAsync,
  fetchUpdateAsync,
  useUpdates,
} from "expo-updates";
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

import { BaseButton } from "@/components/button/base-button";
import { ProfileLanguageChanger } from "@/features/user/components/profile-language-changer";
import { ProfileListItem } from "@/features/user/components/profile-list-item";
import { ProfileThemeChanger } from "@/features/user/components/profile-theme-changer";
import { useGetUser } from "@/features/user/hooks/use-get-user";
import { persistence } from "@/lib/layers/persistence";
import { appRuntime } from "@/lib/layers/runtime";
import { useTranslation } from "@/providers/i18n/context";
import { BLURHASH } from "@/shared/constants/global";
import { formatDisplayDate } from "@/utils/date";
import type { ToastCustomData } from "@/utils/toast";

const BirthDate = ({
  birthDate,
  locale,
}: {
  birthDate: string | undefined;
  locale: string;
}) => {
  if (birthDate === undefined || birthDate === "") {
    return null;
  }

  return (
    <Paragraph size="$2" opacity={0.7}>
      {formatDisplayDate(birthDate, locale)}
    </Paragraph>
  );
};

const EditProfileSection = () => {
  const { t, locale } = useTranslation();
  const user = useAtomValue(persistence.sessionAtom);

  const { data } = useGetUser(
    user
      ? {
          id: user.id,
        }
      : undefined
  );

  const { birthDate, email, image, username } = data ?? {};

  return (
    <XStack mb="$3" height="$10" gap="$5">
      <Image
        testID="profile-image"
        source={image}
        placeholder={{ blurhash: BLURHASH }}
        transition={1000}
        contentFit="fill"
        style={{ borderRadius: 1000, width: 100 }}
      />

      <YStack flex={1}>
        <H6 size="$4">{username}</H6>
        <Paragraph size="$3">{email}</Paragraph>
        <BirthDate birthDate={birthDate} locale={locale} />

        <BaseButton mt="auto" p="$2" width="$11" icon={<Feather name="edit" />}>
          {t("editProfile")}
        </BaseButton>
      </YStack>
    </XStack>
  );
};

const CheckForUpdatesListItem = () => {
  const { show } = useToastController();
  const { t } = useTranslation();
  const { isUpdateAvailable, isUpdatePending } = useUpdates();
  useFocusEffect(() => {
    void (async () => {
      try {
        await checkForUpdateAsync();
      } catch (error) {
        show(error instanceof Error ? error.message : String(error), {
          customData: {
            preset: "error",
          } satisfies ToastCustomData,
        });
      }
    })();
  });
  useFocusEffect(() => {
    if (isUpdatePending) {
      void (async () => {
        try {
          await reloadAsync();
        } catch (error) {
          show(error instanceof Error ? error.message : String(error), {
            customData: {
              preset: "error",
            } satisfies ToastCustomData,
          });
        }
      })();
    }
  });

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <ProfileListItem
      icon={<Feather name="download-cloud" />}
      onPress={() => {
        void (async () => {
          try {
            await fetchUpdateAsync();
          } catch (error) {
            show(error instanceof Error ? error.message : String(error), {
              customData: {
                preset: "error",
              } satisfies ToastCustomData,
            });
          }
        })();
      }}
    >
      <ListItem.Text>{t("newUpdateAvailable")}</ListItem.Text>
      <ListItem.Subtitle>{t("downloadAndInstallUpdate")}</ListItem.Subtitle>
    </ProfileListItem>
  );
};

const LogoutListItem = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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
        // `Stack.Protected` guards on `sessionAtom`, so ending it is the navigation.
        void appRuntime.runPromise(endSession);
      }}
    >
      <ListItem.Text color="$red10">{t("logout")}</ListItem.Text>
    </ProfileListItem>
  );
};

export { BaseErrorBoundary as ErrorBoundary } from "@/components/base-error-boundary";

const TabsProfileScreen = () => (
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

export default TabsProfileScreen;
