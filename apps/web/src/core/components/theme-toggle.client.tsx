"use client";

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
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
  // SAFETY: the lookup is guarded by the `??` fallback, so an unknown theme name
  // simply misses instead of producing an undefined icon.
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
          // SAFETY: `selectionMode="single"` rules out the "all" sentinel, and every
          // menu item below is keyed by one of the values named here.
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: "system" | "light" | "dark";
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
