import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const ENV_CLIENT = createEnv({
  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_APP_TITLE: z.string().min(1),
    EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
})
