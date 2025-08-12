import 'server-only'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
import { headers } from 'next/headers'
import { tryit } from 'radashi'
import { z } from 'zod'
import { auth } from '@/auth/utils/auth'
import { simplifyErrorObject } from '@/core/utils/error'
import { Logger } from '@/core/utils/logger'

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

const logger = new Logger('action.client')

/**
 * Default action client with logging middleware
 */
export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    logger.error('[actionClient]: Error default server error handler', simplifyErrorObject(error))

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
    logger.log(`[actionClient]: ${metadata.actionName} action took ${endTime - startTime}ms`)

    // Return the result of the awaited action.
    return result
  })

/**
 * Action client based on default `actionClient` with authentication middleware
 *
 * @description
 * 1. Get session from database
 * 2. Validate session
 * 3. Return session in action context
 */
export const authActionClient = actionClient
  // Define authorization middleware
  .use(async ({ next }) => {
    // built-in session validation/parsing
    const [error, session] = await tryit(auth.api.getSession)({
      headers: await headers(),
    })

    if (error) {
      logger.error('[authActionClient]: Unauthorized: Error getting session', simplifyErrorObject(error))
      throw new Error('[authActionClient]: Unauthorized: Error getting session')
    }

    if (!session) {
      logger.error('[authActionClient]: Unauthorized: No session found')
      throw new Error('[authActionClient]: Unauthorized: No session found')
    }

    logger.log('[authActionClient]: Authorized: Session is valid')
    // Return the next middleware with `userId` value in the context
    return next({ ctx: session })
  })
