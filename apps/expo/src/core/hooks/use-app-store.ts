import { appStateStorage, appStorageId } from '@/core/services/mmkv'
import { authLoginResponseSchema } from '@workspace/core/apis/auth'
import { z } from 'zod'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AppStoreState = z.infer<typeof appStoreStateSchema>
type AppStore = z.infer<typeof _appStoreSchema>

const appStoreStateSchema = z.object({
  user: authLoginResponseSchema.nullable(),
  theme: z.enum(['system', 'light', 'dark']),
})
const appStoreActionSchema = z.object({
  reset: z.function().args(z.void()).returns(z.void()),
  resetUser: z.function().args(z.void()).returns(z.void()),
  setUser: z.function().args(authLoginResponseSchema).returns(z.void()),
  setTheme: z.function().args(appStoreStateSchema.shape.theme).returns(z.void()),
})
const _appStoreSchema = appStoreStateSchema.merge(appStoreActionSchema)

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
