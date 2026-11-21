import {
  localeNames,
  locales,
  localeSchema,
} from "@workspace/core/i18n/locale";
import { Schema } from "effect";
import { HiGlobeAlt } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/components/ui/menu";
import { useTranslation } from "@/providers/i18n/context";

const isLocale = Schema.is(localeSchema);

export const LanguageToggle = () => {
  const { t, setLocale, locale } = useTranslation();

  return (
    <MenuTrigger>
      <Button intent="plain">
        <HiGlobeAlt className="size-6" />
        {localeNames[locale]}
      </Button>

      <Menu
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(selection) => {
          const [key] = selection === "all" ? [] : selection;

          if (isLocale(key)) {
            setLocale(key);
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("language")}</MenuHeader>

          {locales.map((item) => (
            <MenuItem key={item} id={item}>
              {localeNames[item]}
            </MenuItem>
          ))}
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
