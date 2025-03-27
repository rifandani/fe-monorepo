import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'
import { authLoginResponseSchema } from '@workspace/core/apis/auth'
import { logger } from '@workspace/core/utils/logger'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
import { zodAdapter } from 'next-safe-action/adapters/zod'
import { cookies } from 'next/headers'
import { z } from 'zod'
import 'server-only'

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

/**
 * Default action client with logging middleware
 */
export const actionClient = createSafeActionClient({
  validationAdapter: zodAdapter(),
  handleServerError: (error) => {
    logger.error(error instanceof Error ? error.message : error, '[actionClient]: Error default server error handler')

    if (error instanceof Error) {
      return error.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
  // Here we define a metadata type to be used in `metadata` instance method.
  defineMetadataSchema() {
    return z.object({
      actionName: z.string().describe('The name of the action'),
    })
  },
})
  // Define logging middleware
  .use(async ({ next, metadata }) => {
    const startTime = performance.now()
    const result = await next()
    const endTime = performance.now()

    // Log the action execution time
    logger.info(`[actionClient]: ${metadata.actionName} action took ${endTime - startTime}ms`)

    // Return the result of the awaited action.
    return result
  })

/**
 * Action client based on default `actionClient` with authentication middleware that parses the session from the cookie and returns the session in the context
 */
export const authActionClient = actionClient
  // Define authorization middleware
  .use(async ({ next }) => {
    const cookie = await cookies()

    const session = cookie.get(AUTH_COOKIE_NAME)?.value
    if (!session) {
      logger.error('[authActionClient]: Unauthorized: No session found')
      throw new Error('[authActionClient]: Unauthorized: No session found')
    }

    const parsedSession = authLoginResponseSchema.safeParse(JSON.parse(atob(session)))
    if (parsedSession.error) {
      logger.error(parsedSession.error, '[authActionClient]: Unauthorized: Session is not valid')
      throw new Error('[authActionClient]: Unauthorized: Session is not valid')
    }

    logger.info('[authActionClient]: Authorized: Session is valid')
    // Return the next middleware with `userId` value in the context
    return next({ ctx: { session: parsedSession.data } })
  })
