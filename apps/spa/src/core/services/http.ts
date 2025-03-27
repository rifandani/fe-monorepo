import { env } from '@/core/constants/env'
import { Http } from '@workspace/core/services/http'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: env.apiBaseUrl,
})
