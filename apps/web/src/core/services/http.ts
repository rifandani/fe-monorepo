import { Http } from '@workspace/core/services/http'
import { ENV } from '@/core/constants/env'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: ENV.NEXT_PUBLIC_API_BASE_URL,
})
