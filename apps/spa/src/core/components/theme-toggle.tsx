import { useAtom } from "@effect/atom-react";
import { themes } from "@workspace/core/constants/core";
import type { Theme } from "@workspace/core/constants/core";
import { Match } from "effect";
import { HiComputerDesktop, HiMoon, HiSun } from "react-icons/hi2";
import type { Key } from "react-stately";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui/menu";
import { persistence } from "@/core/layers/persistence";
import { useTranslation } from "@/core/providers/i18n/context";

const isTheme = (key: Key): key is Theme =>
  themes.some((theme) => theme === key);

export const ThemeToggle = () => {
  const { t } = useTranslation();

  // `Entry` owns applying the mode to `<html>`; this only reads and writes the pick
  const [theme, setTheme] = useAtom(persistence.themeAtom);

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
        selectedKeys={new Set([theme])}
        onSelectionChange={(selection) => {
          // `selectionMode="single"` rules out the "all" sentinel.
          const [key] = selection === "all" ? [] : selection;

          if (key !== undefined && isTheme(key)) {
            setTheme(key);
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("theme")}</MenuHeader>

          <MenuItem id="system" className="mt-1">
            {t("system")}
          </MenuItem>
          <MenuItem id="light">{t("light")}</MenuItem>
          <MenuItem id="dark">{t("dark")}</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
