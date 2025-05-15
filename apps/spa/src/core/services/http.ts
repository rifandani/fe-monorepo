import { Http } from '@workspace/core/services/http'
import { env } from '@/core/constants/env'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: env.apiBaseUrl,
})
