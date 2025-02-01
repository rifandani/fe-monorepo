import { ENV } from '@/core/constants/env'
import { Http } from '@workspace/core/services/http.service'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: ENV.NEXT_PUBLIC_API_BASE_URL,
  // validateStatus: status =>
  //   // Resolve only if the status code is less than 500
  //   status < 500,
})
