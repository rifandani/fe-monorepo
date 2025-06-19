import type { AuthLoginResponseSchema } from '@workspace/core/apis/auth'
import { authLoginResponseSchema } from '@workspace/core/apis/auth'
import { isFunction } from 'radashi'
import React from 'react'
import { z } from 'zod/v4'
import { create, createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { appStateStorage, appStorageId } from '@/core/services/mmkv'

export type AppStoreState = z.infer<typeof _appStoreStateSchema>
export interface AppStoreAction {
  reset: () => void
  resetUser: () => void
  setUser: (user: AuthLoginResponseSchema) => void
  setTheme: (theme: AppStoreState['theme']) => void
}
type AppStore = AppStoreState & AppStoreAction

const _appStoreStateSchema = z.object({
  user: authLoginResponseSchema.nullable(),
  theme: z.enum(['system', 'light', 'dark']),
})

/**
 * app store state default values
 */
export const appStoreStateDefaultValues: AppStoreState = {
  user: null,
  theme: 'system',
}

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
    set => ({
      user: appStoreStateDefaultValues.user,
      theme: appStoreStateDefaultValues.theme,

      reset: () => {
        set(appStoreStateDefaultValues)
      },
      resetUser: () => {
        set({ user: appStoreStateDefaultValues.user })
      },
      setUser: (user) => {
        set({ user })
      },
      setTheme: (theme) => {
        set({ theme })
      },
    }),
    {
      name: appStorageId, // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => appStateStorage), // custom mmkv storage
    },
  ),
)

/**
 * for use with react context to initialize the store with props (default state)
 *
 * @link https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
function createAppStore(initialState?: Partial<AppStoreState>) {
  return createStore<AppStore>()(
    persist(
      set => ({
        user: null,
        theme: 'system',
        ...initialState,

        reset: () => {
          set(appStoreStateDefaultValues)
        },
        resetUser: () => {
          set({ user: appStoreStateDefaultValues.user })
        },
        setUser: (user) => {
          set({ user })
        },
        setTheme: (theme) => {
          set({ theme })
        },
      }),
      {
        name: appStorageId, // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => appStateStorage), // custom mmkv storage
      },
    ),
  )
}

export const AppContext = React.createContext<ReturnType<
  typeof createAppStore
> | null>(null)

export function useAppContext<T>(selector: (_store: AppStore) => T): T {
  const store = React.use(AppContext)
  if (!store)
    throw new Error('useAppContext: cannot find the AppContext')

  return useStore(store, selector)
}

/**
 * for use with react context to initialize the store with props (default state)
 *
 * @link https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
 */
export function AppProvider({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | ((context: ReturnType<typeof createAppStore>) => React.ReactNode)
  initialState?: Parameters<typeof createAppStore>[0]
}) {
  const storeRef = React.useRef<ReturnType<typeof createAppStore> | null>(
    null,
  )
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState)
  }

  return (
    <AppContext value={storeRef.current}>
      {isFunction(children) ? children(storeRef.current) : children}
    </AppContext>
  )
}
