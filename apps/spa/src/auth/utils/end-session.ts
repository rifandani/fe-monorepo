import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
import { queryClient } from "@/core/providers/query/client";

/**
 * @description Discard the Session, whether the person signed out or the server
 * rejected the Access Token. Clears the cached queries too, so the next Session
 * never reads the previous one's data.
 *
 * Deliberately does not navigate — the two callers differ (a menu action routes
 * to `/login`, a rejected token is caught by the route guard on the next load),
 * and the router has no business behind this seam.
 */
export const endSession = () => {
  useAuthUserStore.getState().clearUser();
  queryClient.clear();
};
