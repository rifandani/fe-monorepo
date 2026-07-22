"use client";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import type { Selection } from "react-stately";
import { toast } from "sonner";

import { setUserLocaleAction } from "@/core/actions/i18n";
import {
  Button,
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
} from "@/core/components/ui";
import type { I18NLocale } from "@/core/constants/i18n";

export const LanguageToggle = () => {
  const locale = useLocale();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  return (
    <Menu>
      <Button intent="outline" data-slot="menu-trigger">
        <GlobeAltIcon className="size-6" />
        {locale === "en" ? "English" : "Indonesia"}
      </Button>

      <MenuContent
        selectionMode="single"
        selectedKeys={new Set([locale])}
        onSelectionChange={(_selection) => {
          const selection = _selection as Exclude<Selection, "all"> & {
            currentKey: I18NLocale;
          };
          startTransition(async () => {
            const result = await setUserLocaleAction(selection.currentKey);
            if (result?.error) {
              toast.error(result.error);
            }
          });
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("language")}</MenuHeader>

          <MenuItem id="en" isDisabled={isPending}>
            English
          </MenuItem>
          <MenuItem id="id" isDisabled={isPending}>
            Indonesia
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  );
};
