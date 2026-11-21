import Feather from "@expo/vector-icons/Feather";
import { localeNames, locales } from "@workspace/core/i18n/locale";
import { Fragment } from "react";
import { ListItem } from "tamagui";

import { FitSheet } from "@/components/sheet/fit-sheet";
import { ProfileListItem } from "@/features/user/components/profile-list-item";
import { useBaseSheet } from "@/hooks/use-base-sheet";
import { useTranslation } from "@/providers/i18n/context";

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
        {locales.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && <FitSheet.Separator />}
            <FitSheet.Item>
              <ListItem
                pressTheme
                title={localeNames[item]}
                iconAfter={
                  locale === item ? (
                    <Feather
                      testID={`profile-language-${localeNames[item].toLowerCase()}-checked`}
                      name="check-circle"
                      size={20}
                    />
                  ) : undefined
                }
                onPress={() => {
                  setLocale(item);
                }}
              />
            </FitSheet.Item>
          </Fragment>
        ))}
      </FitSheet>
    </>
  );
};
