import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useLocalStorage } from "@reactuses/core";
import type { Selection } from "react-stately";
import { match } from "ts-pattern";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuContent,
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
    <Menu>
      <Button intent="outline">
        {match(theme)
          .with("auto", () => <ComputerDesktopIcon className="size-6" />)
          .with("light", () => <SunIcon className="size-6" />)
          .with("dark", () => <MoonIcon className="size-6" />)
          .otherwise(() => (
            <ComputerDesktopIcon className="size-6" />
          ))}
      </Button>

      <MenuContent
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
      </MenuContent>
    </Menu>
  );
};
