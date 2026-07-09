/* oxlint-disable eslint/func-style -- function declarations */
import Feather from "@expo/vector-icons/Feather";
import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { useState } from "react";
import { ListItem, Separator, YGroup } from "tamagui";

import { BaseSheet } from "@/core/components/sheet/base-sheet";
import type { BaseSheetState } from "@/core/components/sheet/types";
import { useTranslation } from "@/core/providers/i18n/context";
import { ProfileListItem } from "@/user/components/profile-list-item";

export function ProfileLanguageChanger() {
  const { t, locale, setLocale } = useTranslation();
  const [state, setState] = useState<BaseSheetState>({
    open: false,
    position: 0,
  });
  return (
    <>
      <ProfileListItem
        title={t("language")}
        icon={<Feather name="globe" />}
        onPress={() => {
          setState({ ...state, open: true });
        }}
      />

      <BaseSheet
        state={state}
        setState={setState}
        sheetProps={{ snapPointsMode: "fit" }}
        frameProps={{ p: "$5" }}
      >
        <YGroup verticalAlign="center" bordered separator={<Separator />}>
          <YGroup.Item>
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
          </YGroup.Item>
          <YGroup.Item>
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
          </YGroup.Item>
        </YGroup>
      </BaseSheet>
    </>
  );
}
