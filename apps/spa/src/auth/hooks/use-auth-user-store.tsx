import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import { isFunction } from "radashi";
import * as React from "react";
import { z } from "zod";
import { create, createStore, useStore } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type UserStoreState = z.infer<typeof userStoreStateSchema>;
export interface UserStoreAction {
  setUser: (user: AuthLoginResponseSchema) => void;
  clearUser: () => void;
}
export type UserStore = UserStoreState & UserStoreAction;
export type UserStoreLocalStorage = z.infer<typeof userStoreLocalStorageSchema>;
export const userStoreName = "app-user" as const;
const userStoreStateSchema = z.object({
  user: authLoginResponseSchema.nullable(),
});
export const userStoreLocalStorageSchema = z.object({
  state: userStoreStateSchema,
  version: z.number(),
});
/**
 * Hooks to manipulate user store
 *
 * @example
 *
 * ```tsx
 * const { user, setUser, clearUser } = useUserStore()
 * ```
 */
export const useAuthUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        clearUser: () => {
          set({ user: null });
        },
        setUser: (user) => {
          set({ user });
        },
        user: null,
      }),
      {
        // name of the item in the storage (must be unique)
        name: userStoreName,
        // by default, 'localStorage' is used
        storage: createJSONStorage(() => localStorage),
        // a migration will be triggered if the version in the storage mismatches this one
        version: 0,
      }
    )
  )
);
const createUserStore = (initialState?: Partial<UserStoreState>) =>
  createStore<UserStore>()(
    devtools((set) => ({
      clearUser: () => {
        set({ user: null });
      },
      setUser: (user) => {
        set({ user });
      },
      user: null,
      ...initialState,
    }))
  );
export const UserContext = React.createContext<ReturnType<
  typeof createUserStore
> | null>(null);
export const useUserContext = <T,>(selector: (_store: UserStore) => T): T => {
  const store = React.use(UserContext);
  if (!store) {
    throw new Error("useUserContext: cannot find the UserContext");
  }
  return useStore(store, selector);
};
/**
 * for use with react context to initialize the store with props (default state)
 *
 * @see https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
export const UserProvider = ({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | ((context: ReturnType<typeof createUserStore>) => React.ReactNode);
  initialState?: Parameters<typeof createUserStore>[0];
}) => {
  const storeRef = React.useRef<ReturnType<typeof createUserStore> | null>(
    null
  );
  if (!storeRef.current) {
    storeRef.current = createUserStore(initialState);
  }
  return (
    <UserContext value={storeRef.current}>
      {isFunction(children) ? children(storeRef.current) : children}
    </UserContext>
  );
};
