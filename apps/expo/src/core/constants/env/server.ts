import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4'

export const ENV_SERVER = createEnv({
  server: {
    APP_VARIANT: z.string().min(1),
  },
  runtimeEnv: process.env,
})
