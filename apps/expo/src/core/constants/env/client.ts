import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4'

export const ENV_CLIENT = createEnv({
  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_API_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
})
