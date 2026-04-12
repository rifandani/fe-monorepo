import { Http } from '@workspace/core/services/http'
import { ENV } from '@/core/constants/env'

// Set config defaults when creating the instance
export const http = new Http({
  prefix: ENV.VITE_API_BASE_URL,
})
