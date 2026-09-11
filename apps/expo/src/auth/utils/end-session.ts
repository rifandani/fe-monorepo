import { useAppStore } from "@/core/hooks/use-app-store";
import { queryClient } from "@/core/providers/query/client";

/**
 * @description Discard the Session, whether the person signed out or the server
 * rejected the Access Token. Clears the cached queries too, so the next Session
 * never reads the previous one's data.
 *
 * Calls `resetUser`, never `reset` — the Session and the theme share one
 * persisted blob, and only the Session is being ended here.
 *
 * Deliberately does not navigate: `Stack.Protected` in `app/_layout.tsx` guards
 * on the store, so clearing it is the navigation.
 */
export const endSession = () => {
  useAppStore.getState().resetUser();
  queryClient.clear();
};
