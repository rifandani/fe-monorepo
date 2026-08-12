import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import type { BasicColorMode } from "@workspace/core/hooks/use-color-mode";
import { useColorMode } from "@workspace/core/hooks/use-color-mode";
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
import { useTranslation } from "@/core/providers/i18n/context";

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useColorMode();
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
        selectedKeys={new Set([theme as string])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: "auto" | BasicColorMode;
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
