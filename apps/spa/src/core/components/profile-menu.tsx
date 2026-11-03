import { useAtomValue } from "@effect/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { endSession } from "@workspace/core/session/session";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
import {
  HiArrowRightStartOnRectangle,
  HiCog6Tooth,
  HiUser,
} from "react-icons/hi2";

import { Avatar } from "@/core/components/ui/avatar";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
} from "@/core/components/ui/menu";
import { persistence } from "@/core/layers/persistence";
import { useTranslation } from "@/core/providers/i18n/context";
import { appRuntime } from "@/core/services/runtime";

export const ProfileMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAtomValue(persistence.sessionAtom);

  const logout = async () => {
    await appRuntime.runPromise(endSession);
    await navigate({ to: "/login" });
  };

  return (
    <MenuTrigger>
      <ButtonPrimitive
        className="focus-visible:ring-primary relative inline text-start outline-hidden focus-visible:ring-1"
        data-slot="menu-trigger"
      >
        <Avatar initials={user?.username?.slice(0, 2).toUpperCase() ?? "??"} />
      </ButtonPrimitive>

      <Menu
        onAction={(key) => {
          if (key === "logout") {
            void logout();
          }
        }}
      >
        <MenuSection>
          <MenuHeader separator>{t("account")}</MenuHeader>

          <MenuItem id="profile" className="mt-1 gap-x-2">
            <HiUser className="size-6" />
            <span>{t("profile")}</span>
          </MenuItem>
          <MenuItem id="settings" className="gap-x-2">
            <HiCog6Tooth className="size-6" />
            <span>{t("settings")}</span>
          </MenuItem>
        </MenuSection>

        <MenuSeparator />

        <MenuSection>
          <MenuItem id="logout" className="gap-x-2">
            <HiArrowRightStartOnRectangle className="size-6" />
            <p>{t("logout")}</p>
          </MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
