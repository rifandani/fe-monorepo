import { env } from '@/core/constants/env.constant'
import { Http } from '@workspace/core/services/http.service'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: env.apiBaseUrl,
})
