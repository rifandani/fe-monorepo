import { useLocalStorage } from "@reactuses/core";
import { Match } from "effect";
import { HiComputerDesktop, HiMoon, HiSun } from "react-icons/hi2";
import type { Selection } from "react-stately";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui/menu";
import type { ColorMode } from "@/core/constants/global";
import { COLOR_MODE_STORAGE_KEY } from "@/core/constants/global";
import { useTranslation } from "@/core/providers/i18n/context";

export const ThemeToggle = () => {
  const { t } = useTranslation();

  // `Entry` owns applying the mode to `<html>`; this only reads and writes the pick
  const [theme, setTheme] = useLocalStorage<ColorMode>(
    COLOR_MODE_STORAGE_KEY,
    "auto"
  );

  return (
    <MenuTrigger>
      <Button intent="outline">
        {Match.value(theme).pipe(
          Match.when("light", () => <HiSun className="size-6" />),
          Match.when("dark", () => <HiMoon className="size-6" />),
          Match.orElse(() => <HiComputerDesktop className="size-6" />)
        )}
      </Button>

      <Menu
        selectionMode="single"
        selectedKeys={new Set([theme ?? "auto"])}
        onSelectionChange={(_selection) => {
          // SAFETY: `selectionMode="single"` rules out the "all" sentinel, and every
          // menu item below is keyed by one of the values named here.
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: ColorMode;
          };

          setTheme(selection.currentKey);
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("theme")}</MenuHeader>

          <MenuItem id="auto" className="mt-1">
            {t("system")}
          </MenuItem>
          <MenuItem id="light">{t("light")}</MenuItem>
          <MenuItem id="dark">{t("dark")}</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
