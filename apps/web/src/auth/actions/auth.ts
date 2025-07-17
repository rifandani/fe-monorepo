'use server'

import type { ActionResult } from '@/core/utils/action'
import { metrics, SpanStatusCode, trace } from '@opentelemetry/api'
import { authLoginRequestSchema, authRepositories } from '@workspace/core/apis/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { tryit } from 'radashi'
import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'
import { http } from '@/core/services/http'
import { actionClient } from '@/core/utils/action'
import { repositoryErrorMapper } from '@/core/utils/error'
import { Logger } from '@/core/utils/logger'
import { recordSpan } from '@/core/utils/telemetry'

const logger = new Logger('authAction')
const meter = metrics.getMeter('authAction')

const loginCounter = meter.createCounter('login', {
  description: 'How many times the login action is called',
})

const logoutCounter = meter.createCounter('logout', {
  description: 'How many times the logout action is called',
})

/**
 * Server action to handle user login.
 *
 * @description
 * 1. Validates the login form data
 * 2. Attempts to authenticate with the server
 * 3. On success: Sets an HTTP-only auth cookie and redirects to home
 * 4. On failure: Returns validation or server error messages
 *
 * @returns {Promise<LoginActionResult | void>} Returns error object if login fails (zod error or server error), void if successful (redirects)
 */
export const loginAction = actionClient
  .metadata({ actionName: 'login' })
  .inputSchema(authLoginRequestSchema)
  .action<ActionResult<null>>(async ({ parsedInput }) => {
    const result = await recordSpan({
      name: 'loginAction',
      tracer: trace.getTracer('auth'),
      attributes: parsedInput,
      fn: async (span) => {
        loginCounter.add(1)
        logger.log('loginAction', { parsedInput })

        const [error, response] = await tryit(authRepositories(http).login)({ json: parsedInput })
        if (error) {
          span.recordException({
            name: error.name,
            message: error.message,
            stack: error.stack,
          })
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          })
          return await repositoryErrorMapper(error)
        }

        span.addEvent('Start set session cookie', response)
        const cookie = await cookies()
        cookie.set(AUTH_COOKIE_NAME, btoa(JSON.stringify(response)), {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 1, // 1 days
          path: '/',
        })

        // INFO: we can't use redirect in try catch block, because redirect will throw an error object
        span.addEvent('Start redirect to /')
      },
    })

    if (result) {
      return result
    }

    redirect('/')
  })

/**
 * Server action to handle user logout.
 *
 * @description
 * 1. Removes the authentication cookie
 * 2. Redirects user to the login page
 *
 * @returns {Promise<void>} Redirects to login page
 */
export const logoutAction = actionClient
  .metadata({ actionName: 'logoutAction' })
  .action(async () => {
    await recordSpan({
      name: 'logoutAction',
      tracer: trace.getTracer('auth'),
      fn: async (span) => {
        logoutCounter.add(1)
        logger.log('logoutAction')

        const cookie = await cookies()
        cookie.delete(AUTH_COOKIE_NAME)

        span.addEvent('Start redirect to /login')
      },
    })

    redirect('/login')
  })
