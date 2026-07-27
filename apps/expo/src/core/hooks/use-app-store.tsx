import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appStateStorage, appStorageId } from "@/core/services/mmkv";

import { appStoreStateDefaultValues } from "./app-store-state-defaults";

export type AppStoreState = z.infer<typeof _appStoreStateSchema>;
interface AppStoreAction {
  reset: () => void;
  resetUser: () => void;
  setUser: (user: AuthLoginResponseSchema) => void;
  setTheme: (theme: AppStoreState["theme"]) => void;
}
type AppStore = AppStoreState & AppStoreAction;
const _appStoreStateSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  user: authLoginResponseSchema.nullable(),
});
/**
 * Hooks to manipulate global app store that integrated with MMKV
 *
 * @example
 *
 * ```tsx
 * const user = useAppStore(state => state.user)
 * const setUser = useAppStore(state => state.setUser)
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      reset: () => {
        set(appStoreStateDefaultValues);
      },
      resetUser: () => {
        set({ user: appStoreStateDefaultValues.user });
      },
      setTheme: (theme) => {
        set({ theme });
      },
      setUser: (user) => {
        set({ user });
      },
      theme: appStoreStateDefaultValues.theme,
      user: appStoreStateDefaultValues.user,
    }),
    {
      name: appStorageId, // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => appStateStorage), // custom mmkv storage
    }
  )
);
