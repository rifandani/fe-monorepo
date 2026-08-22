/* oxlint-disable react/react-compiler react-doctor/only-export-components */
import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type UserStoreState = z.infer<typeof userStoreStateSchema>;
interface UserStoreAction {
  setUser: (user: AuthLoginResponseSchema) => void;
  clearUser: () => void;
}
type UserStore = UserStoreState & UserStoreAction;
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
