import 'server-only'
import { randomUUID } from 'node:crypto'
import { auth } from '@/auth/utils/auth'
import {
  getClientIpAddress,
} from '@/core/utils/net'
import { rateLimiter } from './core'
import { DbStore } from './store'

const RATE_LIMIT_WINDOW_MS = 15_000 // 15 seconds
const RATE_LIMIT_LIMIT = 15 // Limit each IP to 150 requests per 15 seconds (10 req/s average)

/**
 * rate limit middleware using drizzle postgres store with default rate limit of 10 req/s
 */
export const rateLimit = rateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_LIMIT,
  standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: async ({ request }) => {
    // for authenticated users, use session id
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (session) {
      return `session:${session.session.id}`
    }

    // get IP address from headers (most common)
    const ipAddressFromHeaders = getClientIpAddress(request.headers)

    return `ip:${ipAddressFromHeaders || `anonymous:${randomUUID()}`}`
  },
  // drizzle postgres store
  store: new DbStore(),
})
