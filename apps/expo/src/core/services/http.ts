import { ENV_CLIENT } from '@/core/constants/env/client'
import { Http } from '@workspace/core/services/http'

// Set config defaults when creating the instance
export const http = new Http({
  prefixUrl: ENV_CLIENT.EXPO_PUBLIC_API_BASE_URL,
})
