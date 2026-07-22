/* oxlint-disable react/react-compiler react-doctor/only-export-components */
import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import { isFunction } from "radashi";
import { createContext, use, useRef } from "react";
import type { ReactNode } from "react";
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
        name: userStoreName, // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => localStorage), // by default, 'localStorage' is used
        version: 0, // a migration will be triggered if the version in the storage mismatches this one
      }
    )
  )
);
const createUserStore = (initialState?: Partial<UserStoreState>) =>
  createStore<UserStore>()(
    devtools((set) => ({
      user: null,
      ...initialState,
      setUser: (user) => {
        set({ user });
      },
      clearUser: () => {
        set({ user: null });
      },
    }))
  );
export const UserContext = createContext<ReturnType<
  typeof createUserStore
> | null>(null);
export const useUserContext = <T,>(selector: (_store: UserStore) => T): T => {
  const store = use(UserContext);
  if (!store) {
    throw new Error("useUserContext: cannot find the UserContext");
  }
  return useStore(store, selector);
};
export const UserProvider = ({
  children,
  initialState,
}: {
  children:
    | ReactNode
    | ((context: ReturnType<typeof createUserStore>) => ReactNode);
  initialState?: Parameters<typeof createUserStore>[0];
}) => {
  const storeRef = useRef<ReturnType<typeof createUserStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createUserStore(initialState);
  }
  return (
    <UserContext value={storeRef.current}>
      {isFunction(children) ? children(storeRef.current) : children}
    </UserContext>
  );
};
