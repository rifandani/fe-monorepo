import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { Match } from "effect";
import { HiGlobeAlt } from "react-icons/hi2";
import type { Selection } from "react-stately";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui/menu";
import { useTranslation } from "@/core/providers/i18n/context";

export const LanguageToggle = () => {
  const { t, setLocale, locale } = useTranslation();

  return (
    <MenuTrigger>
      <Button intent="plain">
        <HiGlobeAlt className="size-6" />
        {Match.value(locale).pipe(
          Match.when("en-us", () => "English"),
          Match.orElse(() => "Indonesia")
        )}
      </Button>

      <Menu
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(_selection) => {
          // SAFETY: `selectionMode="single"` rules out the "all" sentinel, and every
          // menu item below is keyed by one of the values named here.
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: LocaleDictLanguage;
          };

          setLocale(selection.currentKey);
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("language")}</MenuHeader>

          <MenuItem id="en-us">English</MenuItem>
          <MenuItem id="id-id">Indonesia</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
