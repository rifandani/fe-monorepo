import 'server-only'
import { authLoginResponseSchema } from '@workspace/core/apis/auth'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'

/**
 * Get the authenticated user from the cookie
 *
 * @returns {Promise<AuthLoginResponse | null>} The authenticated user or null if not authenticated or the session data is invalid
 */
export async function getAuthUser() {
  const cookie = await cookies()
  const session = cookie.get(AUTH_COOKIE_NAME)?.value

  if (!session) {
    return null
  }

  const parsedSession = authLoginResponseSchema.safeParse(JSON.parse(atob(session)))

  if (!parsedSession.success) {
    return null
  }

  return parsedSession.data
}
