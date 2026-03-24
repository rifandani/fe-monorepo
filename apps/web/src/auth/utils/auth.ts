import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { openAPI } from 'better-auth/plugins'
import { ENV } from '@/core/constants/env'
import { SERVICE_NAME } from '@/core/constants/global'
import { ipAddressHeaders } from '@/core/utils/net'
import { db } from '@/db'
import * as schema from '@/db/schema'

const RATE_LIMIT_WINDOW_SECONDS = 15 // 15 seconds
const RATE_LIMIT_MAX_REQUESTS = 10 * RATE_LIMIT_WINDOW_SECONDS // 10 req/s

export const auth = betterAuth({
  appName: SERVICE_NAME,
  secret: ENV.BETTER_AUTH_SECRET,
  baseURL: ENV.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
      rate_limit: schema.rateLimitTable,
    },
  }),
  trustedOrigins: [ENV.NEXT_PUBLIC_APP_URL],
  emailAndPassword: { enabled: true },
  /**
   * server-side requests made using `auth.api` aren't affected by rate limiting.
   * rate limits only apply to client-initiated requests.
   *
   * @see https://better-auth.com/docs/concepts/rate-limit
   */
  rateLimit: {
    // enabled: true, // by default disabled in development mode
    window: RATE_LIMIT_WINDOW_SECONDS, // time window in seconds
    max: RATE_LIMIT_MAX_REQUESTS, // max requests in the window (10 req/s)
    storage: 'database',
    modelName: 'rate_limit', // optional, by default "rateLimit" is used
  },
  plugins: [
    openAPI({
      path: '/docs', // at /api/auth/docs
    }),
    nextCookies(), // make sure this is the last plugin in the array
  ],
  advanced: {
    ipAddress: {
      // request headers to check for IP address
      ipAddressHeaders: Object.values(ipAddressHeaders),
    },
  },
  telemetry: {
    enabled: false,
  },
})
