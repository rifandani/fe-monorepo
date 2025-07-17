import { createEnv } from '@t3-oss/env-core'
import { vite } from '@t3-oss/env-core/presets-zod'
import { z } from 'zod/v4'

export const ENV = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1),
    VITE_APP_URL: z.url(),
    VITE_API_BASE_URL: z.url(),
    VITE_FLAGSMITH_ENVIRONMENT_ID: z.string().min(1),
    VITE_FLAGSMITH_API_URL: z.url(),
    VITE_OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
  },
  runtimeEnv: import.meta.env,
  extends: [vite()],
})
