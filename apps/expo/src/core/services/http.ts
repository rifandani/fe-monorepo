import { envSchema } from '@/core/schemas/env'

import ky from 'ky'

// Set config defaults when creating the instance
export const http = ky.create({
  prefixUrl: (() => {
    const env = envSchema.parse(process.env)
    return env.EXPO_PUBLIC_API_BASE_URL
  })(),
})
