import Feather from "@expo/vector-icons/Feather";
import { ListItem } from "tamagui";

import { FitSheet } from "@/core/components/sheet/fit-sheet";
import { useAppStore } from "@/core/hooks/use-app-store";
import { useBaseSheet } from "@/core/hooks/use-base-sheet";
import { useTranslation } from "@/core/providers/i18n/context";
import { ProfileListItem } from "@/user/components/profile-list-item";

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
        <FitSheet.Item>
          <ListItem
            pressTheme
            title={t("light")}
            icon={<Feather name="sun" size={20} />}
            iconAfter={
              theme === "light" ? (
                <Feather
                  testID="profile-theme-light-checked"
                  name="check-circle"
                  size={20}
                />
              ) : undefined
            }
            onPress={() => setTheme("light")}
          />
        </FitSheet.Item>
        <FitSheet.Item>
          <ListItem
            pressTheme
            title={t("dark")}
            icon={<Feather name="moon" size={20} />}
            iconAfter={
              theme === "dark" ? (
                <Feather
                  testID="profile-theme-dark-checked"
                  name="check-circle"
                  size={20}
                />
              ) : undefined
            }
            onPress={() => setTheme("dark")}
          />
        </FitSheet.Item>
        <FitSheet.Item>
          <ListItem
            pressTheme
            title={t("system")}
            icon={<Feather name="tablet" size={20} />}
            iconAfter={
              theme === "system" ? (
                <Feather
                  testID="profile-theme-system-checked"
                  name="check-circle"
                  size={20}
                />
              ) : undefined
            }
            onPress={() => setTheme("system")}
          />
        </FitSheet.Item>
      </FitSheet>
    </>
  );
};
