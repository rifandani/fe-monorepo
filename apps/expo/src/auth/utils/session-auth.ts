import type { HttpAuthConfig } from "@workspace/core/services/http";

import { endSession } from "@/auth/utils/end-session";
import { useAppStore } from "@/core/hooks/use-app-store";

/**
 * @description How the Http module proves this app's Session.
 *
 * Lives here rather than inline in `core/services/http.ts` so the two functions
 * are reachable by a test: the token read and the rejection response are the
 * wiring that can actually be wrong, while the `new Http(...)` call is a
 * declaration.
 */
export const sessionAuth: HttpAuthConfig = {
  // Read per request, so signing in and out need not notify the instance.
  getToken: () => useAppStore.getState().user?.accessToken ?? null,
  onUnauthorized: endSession,
};
