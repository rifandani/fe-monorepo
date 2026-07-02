import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import { isFunction } from "radashi";
import * as React from "react";
import { z } from "zod";
import { create, createStore, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appStateStorage, appStorageId } from "@/core/services/mmkv";

export type AppStoreState = z.infer<typeof _appStoreStateSchema>;
export interface AppStoreAction {
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
 * app store state default values
 */
export const appStoreStateDefaultValues: AppStoreState = {
  theme: "system",
  user: null,
};
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
      name: appStorageId,
      storage: createJSONStorage(() => appStateStorage),
    }
  )
);
const createAppStore = (initialState?: Partial<AppStoreState>) =>
  createStore<AppStore>()(
    persist(
      (set) => ({
        ...initialState,
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
        theme: "system",
        user: null,
      }),
      {
        name: appStorageId,
        storage: createJSONStorage(() => appStateStorage),
      }
    )
  );
export const AppContext = React.createContext<ReturnType<
  typeof createAppStore
> | null>(null);
export const useAppContext = function useAppContext<T>(
  selector: (_store: AppStore) => T
): T {
  const store = React.use(AppContext);
  if (!store) {
    throw new Error("useAppContext: cannot find the AppContext");
  }
  return useStore(store, selector);
};
/**
 * for use with react context to initialize the store with props (default state)
 *
 * @see https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
export const AppProvider = ({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | ((context: ReturnType<typeof createAppStore>) => React.ReactNode);
  initialState?: Parameters<typeof createAppStore>[0];
}) => {
  const storeRef = React.useRef<ReturnType<typeof createAppStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }
  return (
    <AppContext value={storeRef.current}>
      {isFunction(children) ? children(storeRef.current) : children}
    </AppContext>
  );
};
