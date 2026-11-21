import { useAtomValue } from "@effect/atom-react";
import {
  endSession,
  sessionActivityAtom,
} from "@workspace/core/session/session";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
import {
  HiArrowRightStartOnRectangle,
  HiCog6Tooth,
  HiUser,
} from "react-icons/hi2";

import { Avatar } from "@/components/ui/avatar";
import { Loader } from "@/components/ui/loader";
import {
  Menu,
  MenuTrigger,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
} from "@/components/ui/menu";
import { persistence } from "@/lib/layers/persistence";
import { appRuntime } from "@/lib/layers/runtime";
import { useTranslation } from "@/providers/i18n/context";

const logout = async () => {
  await appRuntime.runPromise(endSession);
};

export const ProfileMenu = () => {
  const { t } = useTranslation();
  const user = useAtomValue(persistence.sessionAtom);
  const isRefreshing = useAtomValue(sessionActivityAtom) === "refreshing";

  return (
    <MenuTrigger>
      <ButtonPrimitive
        className="focus-visible:ring-primary relative inline text-start outline-hidden focus-visible:ring-1"
        data-slot="menu-trigger"
      >
        <Avatar initials={user?.username?.slice(0, 2).toUpperCase() ?? "??"} />
        {isRefreshing ? (
          <span className="bg-background absolute -right-1 -bottom-1 rounded-full p-0.5">
            <Loader className="size-3" aria-label={t("sessionRefreshing")} />
          </span>
        ) : null}
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
