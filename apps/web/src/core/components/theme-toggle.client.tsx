"use client";

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import type { BasicColorMode } from "@workspace/core/hooks/use-color-mode";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { Selection } from "react-stately";

import {
  Button,
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui";

const THEME_ICONS = {
  dark: MoonIcon,
  light: SunIcon,
  system: ComputerDesktopIcon,
};

export const ThemeToggle = () => {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "system"; // avoid hydration mismatch
  // `theme` is a free-form string in next-themes, so fall back to the
  // system icon for anything outside the three we render a menu item for.
  const ActiveThemeIcon =
    THEME_ICONS[activeTheme as keyof typeof THEME_ICONS] ?? ComputerDesktopIcon;
  return (
    <Menu>
      <Button intent="outline" data-slot="menu-trigger">
        <ActiveThemeIcon className="size-6" />
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([activeTheme])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: "system" | BasicColorMode;
          };
          setTheme(selection.currentKey);
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("theme")}</MenuHeader>

          <MenuItem id="system">{t("system")}</MenuItem>
          <MenuItem id="light">{t("light")}</MenuItem>
          <MenuItem id="dark">{t("dark")}</MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  );
};
