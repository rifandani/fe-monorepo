import { getSchemaDefaults } from '@workspace/core/utils/core'
import { z } from 'zod'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const defaultValue = import.meta.env.VITE_MODE === 'development'
const featureFlagStoreStateSchema = z.object({
  auth: z.object({
    condition: z.object({
      service_checking: z.boolean().default(defaultValue),
    }),
    endpoint: z.object({
      list_user_access: z.boolean().default(defaultValue),
    }),
    route: z.object({
      '/user-access/role': z.boolean().default(defaultValue),
    }),
    ui: z.object({
      logout_button: z.boolean().default(defaultValue),
    }),
  }),
})

export type FeatureFlagStoreStateSchema = z.infer<
  typeof featureFlagStoreStateSchema
>
export interface FeatureFlagStoreActionSchema {
  reset: () => void
}
export type FeatureFlagStoreSchema = z.infer<
  typeof featureFlagStoreStateSchema
> &
FeatureFlagStoreActionSchema

export const featureFlagStoreInitialState = getSchemaDefaults<
  typeof featureFlagStoreStateSchema
>(featureFlagStoreStateSchema)

/**
 * @example
 *
 * ```tsx
 * const reset = useFeatureFlagStore(state => state.reset)
 * ```
 */
export const useFeatureFlagStore = create<FeatureFlagStoreSchema>()(
  devtools(
    set => ({
      ...featureFlagStoreInitialState,

      reset: () => {
        set(featureFlagStoreInitialState)
      },
    }),
  ),
)
