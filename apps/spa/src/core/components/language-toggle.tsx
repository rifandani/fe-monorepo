import { GlobeAltIcon } from "@heroicons/react/24/outline";
import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import type { Selection } from "react-stately";

import { Button } from "@/core/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui/menu";
import { useTranslation } from "@/core/providers/i18n/context";

export const LanguageToggle = () => {
  const { t, setLocale, locale } = useTranslation();
  return (
    <Menu>
      <Button intent="plain">
        <GlobeAltIcon className="size-6" />
        {locale === "en-us" ? "English" : "Indonesia"}
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(_selection) => {
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
      </MenuContent>
    </Menu>
  );
};
