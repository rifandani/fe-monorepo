import { queryClient } from "@/core/providers/query/client";
import { appStore } from "@/core/stores/app-store";

/**
 * @description Discard the Session, whether the person signed out or the server
 * rejected the Access Token. Clears the cached queries too, so the next Session
 * never reads the previous one's data.
 *
 * Calls `resetUser`, never `reset` — only the Session is being ended here, and
 * the theme is not part of it.
 *
 * Deliberately does not navigate: `Stack.Protected` in `app/_layout.tsx` guards
 * on the user atom, so clearing it is the navigation.
 */
export const endSession = () => {
  appStore.resetUser();
  queryClient.clear();
};
