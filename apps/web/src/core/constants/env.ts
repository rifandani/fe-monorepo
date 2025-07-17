import { createEnv } from '@t3-oss/env-nextjs'
// import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod/v4'

export const ENV = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_APP_TITLE: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: z.string().min(1),
    NEXT_PUBLIC_FLAGSMITH_API_URL: z.url(),
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    NEXT_PUBLIC_OTEL_LOG_LEVEL: z.enum(['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE', 'NONE']),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID,
    NEXT_PUBLIC_FLAGSMITH_API_URL: process.env.NEXT_PUBLIC_FLAGSMITH_API_URL,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
    NEXT_PUBLIC_OTEL_LOG_LEVEL: process.env.NEXT_PUBLIC_OTEL_LOG_LEVEL,
  },
  // extends: [vercel()],
})
