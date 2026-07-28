import Feather from "@expo/vector-icons/Feather";
import { ListItem } from "tamagui";

import { FitSheet } from "@/core/components/sheet/fit-sheet";
import { useAppStore } from "@/core/hooks/use-app-store";
import { useBaseSheet } from "@/core/hooks/use-base-sheet";
import { useTranslation } from "@/core/providers/i18n/context";
import { ProfileListItem } from "@/user/components/profile-list-item";

const THEME_OPTIONS = [
  { icon: "sun", value: "light" },
  { icon: "moon", value: "dark" },
  { icon: "tablet", value: "system" },
] as const;

export const ProfileThemeChanger = () => {
  const { t } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const { state, setState, open } = useBaseSheet();

  return (
    <>
      <ProfileListItem
        title={t("theme")}
        icon={<Feather name="moon" />}
        onPress={open}
      />

      <FitSheet state={state} setState={setState}>
        {THEME_OPTIONS.map((option) => (
          <FitSheet.Item key={option.value}>
            <ListItem
              pressTheme
              title={t(option.value)}
              icon={<Feather name={option.icon} size={20} />}
              iconAfter={
                theme === option.value ? (
                  <Feather
                    testID={`profile-theme-${option.value}-checked`}
                    name="check-circle"
                    size={20}
                  />
                ) : undefined
              }
              onPress={() => setTheme(option.value)}
            />
          </FitSheet.Item>
        ))}
      </FitSheet>
    </>
  );
};
