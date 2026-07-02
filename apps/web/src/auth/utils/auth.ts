import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";

import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";
import { ipAddressHeaders } from "@/core/utils/net";
import { db } from "@/db";
import * as schema from "@/db/schema";

// 15 seconds
const RATE_LIMIT_WINDOW_SECONDS = 15;
// 10 req/s
const RATE_LIMIT_MAX_REQUESTS = 10 * RATE_LIMIT_WINDOW_SECONDS;
export const auth = betterAuth({
  advanced: {
    ipAddress: {
      // request headers to check for IP address
      ipAddressHeaders: Object.values(ipAddressHeaders),
    },
  },
  appName: SERVICE_NAME,
  baseURL: ENV.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account: schema.accountTable,
      rate_limit: schema.rateLimitTable,
      session: schema.sessionTable,
      user: schema.userTable,
      verification: schema.verificationTable,
    },
  }),
  emailAndPassword: { enabled: true },
  plugins: [
    // bearer(), // enables authentication using Bearer tokens as an alternative to browser cookies
    openAPI({
      // at /api/auth/docs
      path: "/docs",
    }),
    // make sure this is the last plugin in the array
    nextCookies(),
  ],
  /**
   * server-side requests made using `auth.api` aren't affected by rate limiting.
   * rate limits only apply to client-initiated requests.
   *
   * @see https://better-auth.com/docs/concepts/rate-limit
   */
  rateLimit: {
    max: RATE_LIMIT_MAX_REQUESTS,
    // optional, by default "rateLimit" is used
    modelName: "rate_limit",
    storage: "database",
    // time window in seconds
    window: RATE_LIMIT_WINDOW_SECONDS,
  },
  secret: ENV.BETTER_AUTH_SECRET,
  telemetry: {
    enabled: false,
  },
  trustedOrigins: [ENV.NEXT_PUBLIC_APP_URL],
});
