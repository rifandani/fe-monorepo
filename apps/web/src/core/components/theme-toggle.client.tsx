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

export const ThemeToggle = () => {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "system"; // avoid hydration mismatch
  return (
    <Menu>
      <Button intent="outline" data-slot="menu-trigger">
        {activeTheme === "system" ? (
          <ComputerDesktopIcon className="size-6" />
        ) : null}
        {activeTheme === "light" ? <SunIcon className="size-6" /> : null}
        {activeTheme === "dark" ? <MoonIcon className="size-6" /> : null}
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
