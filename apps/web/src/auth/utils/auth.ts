import 'server-only'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { openAPI } from 'better-auth/plugins'
import { ENV } from '@/core/constants/env'
import { db } from '@/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  appName: ENV.NEXT_PUBLIC_APP_TITLE,
  secret: ENV.BETTER_AUTH_SECRET,
  baseURL: ENV.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  trustedOrigins: [ENV.NEXT_PUBLIC_APP_URL, 'http://localhost:3002'],
  emailAndPassword: { enabled: true },
  plugins: [
    openAPI(), // at /api/auth/reference
    nextCookies(), // make sure this is the last plugin in the array
  ],
})
