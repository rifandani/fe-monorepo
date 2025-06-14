import { createEnv } from '@t3-oss/env-core'
import { vite } from '@t3-oss/env-core/presets-zod'
import { z } from 'zod'

export const ENV = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1),
    VITE_APP_URL: z.string().url(),
    VITE_API_BASE_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
  extends: [vite()],
})
