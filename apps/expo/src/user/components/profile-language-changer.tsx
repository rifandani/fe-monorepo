import Feather from "@expo/vector-icons/Feather";
import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { ListItem } from "tamagui";

import { FitSheet } from "@/core/components/sheet/fit-sheet";
import { useBaseSheet } from "@/core/hooks/use-base-sheet";
import { useTranslation } from "@/core/providers/i18n/context";
import { ProfileListItem } from "@/user/components/profile-list-item";

export const ProfileLanguageChanger = () => {
  const { t, locale, setLocale } = useTranslation();
  const { state, setState, open } = useBaseSheet();

  return (
    <>
      <ProfileListItem
        title={t("language")}
        icon={<Feather name="globe" />}
        onPress={open}
      />

      <FitSheet state={state} setState={setState}>
        <FitSheet.Item>
          <ListItem
            pressTheme
            theme="light"
            title="English"
            iconAfter={
              locale === "en-us" ? (
                <Feather
                  testID="profile-language-english-checked"
                  name="check-circle"
                  size={20}
                />
              ) : undefined
            }
            onPress={() => setLocale("en-us" satisfies LocaleDictLanguage)}
          />
        </FitSheet.Item>
        <FitSheet.Item>
          <ListItem
            pressTheme
            title="Indonesia"
            iconAfter={
              locale === "id-id" ? (
                <Feather
                  testID="profile-language-indonesia-checked"
                  name="check-circle"
                  size={20}
                />
              ) : undefined
            }
            onPress={() => setLocale("id-id" satisfies LocaleDictLanguage)}
          />
        </FitSheet.Item>
      </FitSheet>
    </>
  );
};
