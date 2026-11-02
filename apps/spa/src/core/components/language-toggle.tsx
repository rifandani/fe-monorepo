import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { Match } from "effect";
import { HiGlobeAlt } from "react-icons/hi2";
import type { Key } from "react-stately";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui/menu";
import { useTranslation } from "@/core/providers/i18n/context";

const isLocaleDictLanguage = (key: Key): key is LocaleDictLanguage =>
  key === "en-us" || key === "id-id";

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
        onSelectionChange={(selection) => {
          // `selectionMode="single"` rules out the "all" sentinel.
          const [key] = selection === "all" ? [] : selection;

          if (key !== undefined && isLocaleDictLanguage(key)) {
            setLocale(key);
          }
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
