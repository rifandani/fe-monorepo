import type { AuthLoginResponseSchema } from '@workspace/core/apis/auth'
import { authLoginResponseSchema } from '@workspace/core/apis/auth'
import { isFunction } from 'radashi'
import React from 'react'
import { z } from 'zod/v4'
import { create, createStore, useStore } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

export type UserStoreState = z.infer<typeof userStoreStateSchema>
export interface UserStoreAction {
  setUser: (user: AuthLoginResponseSchema) => void
  clearUser: () => void
}
export type UserStore = UserStoreState & UserStoreAction
export type UserStoreLocalStorage = z.infer<typeof userStoreLocalStorageSchema>

export const userStoreName = 'app-user' as const
const userStoreStateSchema = z.object({
  user: authLoginResponseSchema.nullable(),
})
export const userStoreLocalStorageSchema = z.object({
  state: userStoreStateSchema,
  version: z.number(),
})

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
      set => ({
        user: null,

        setUser: (user) => {
          set({ user })
        },
        clearUser: () => {
          set({ user: null })
        },
      }),
      {
        name: userStoreName, // name of the item in the storage (must be unique)
        version: 0, // a migration will be triggered if the version in the storage mismatches this one
        storage: createJSONStorage(() => localStorage), // by default, 'localStorage' is used
      },
    ),
  ),
)

/**
 * for use with react context to initialize the store with props (default state)
 *
 * @link https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
function createUserStore(initialState?: Partial<UserStoreState>) {
  return createStore<UserStore>()(
    devtools(set => ({
      user: null,
      ...initialState,

      setUser: (user) => {
        set({ user })
      },
      clearUser: () => {
        set({ user: null })
      },
    })),
  )
}

export const UserContext = React.createContext<ReturnType<
  typeof createUserStore
> | null>(null)

export function useUserContext<T>(selector: (_store: UserStore) => T): T {
  const store = React.use(UserContext)
  if (!store)
    throw new Error('useUserContext: cannot find the UserContext')

  return useStore(store, selector)
}

/**
 * for use with react context to initialize the store with props (default state)
 *
 * @link https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
export function UserProvider({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | ((context: ReturnType<typeof createUserStore>) => React.ReactNode)
  initialState?: Parameters<typeof createUserStore>[0]
}) {
  const storeRef = React.useRef<ReturnType<typeof createUserStore> | null>(
    null,
  )
  if (!storeRef.current) {
    storeRef.current = createUserStore(initialState)
  }

  return (
    <UserContext value={storeRef.current}>
      {isFunction(children) ? children(storeRef.current) : children}
    </UserContext>
  )
}
