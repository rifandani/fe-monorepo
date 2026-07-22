"use client";

import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { logoutAction } from "@/auth/actions/auth";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/core/components/ui";
import { Avatar } from "@/core/components/ui/avatar";

export const ProfileMenu = ({ username }: { username: string }) => {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  return (
    <Menu>
      <MenuTrigger>
        <Avatar initials={username.slice(0, 2).toUpperCase() ?? "??"} />
      </MenuTrigger>

      <MenuContent
        onAction={(key) => {
          const currentKey = key as "profile" | "settings" | "logout";
          if (currentKey === "logout") {
            startTransition(async () => {
              await logoutAction();
            });
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("account")}</MenuHeader>

          <MenuItem id="profile" className="gap-x-2" isDisabled={isPending}>
            <UserIcon className="size-6" />
            <span>{t("profile")}</span>
          </MenuItem>
          <MenuItem id="settings" className="gap-x-2" isDisabled={isPending}>
            <Cog6ToothIcon className="size-6" />
            <span>{t("settings")}</span>
          </MenuItem>
        </MenuSection>

        <MenuSeparator />

        <MenuSection>
          <MenuItem id="logout" className="gap-x-2" isDisabled={isPending}>
            <ArrowRightStartOnRectangleIcon className="size-6" />
            <p>{t("logout")}</p>
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </Menu>
  );
};
