import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMount } from "@workspace/core/hooks/use-mount";
import { toast } from "sonner";
import { match, P } from "ts-pattern";

import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
import { useTranslation } from "@/core/providers/i18n/context";

/**
 * Hooks to check the authentication of your user, wheter they're logged in or not
 *
 * @example
 *
 * ```tsx
 * useAuthChecker()
 * ```
 */
export const useAuthChecker = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthUserStore();
  useMount(() => {
    match([!!user, location.pathname.includes("login")])
      .with([false, true], () => {
        // do nothing
      })
      .with([false, P.any], () => {
        navigate({
          replace: true,
          to: "/login",
        });
        toast.error(t("unauthorized"));
      })
      .with([true, true], () => {
        navigate({
          to: "/",
        });
        toast.info(t("authorized"));
      })
      .otherwise(() => {
        // do nothing
      });
  });
};
