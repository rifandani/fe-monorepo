'use server'

import { auth } from '@/auth/utils/auth'
import type { ActionResult } from '@/core/utils/action'
import { actionClient } from '@/core/utils/action'
import { serverErrorMapper } from '@/core/utils/error'
import { recordSpan } from '@/core/utils/telemetry'
import { metrics, trace } from '@opentelemetry/api'
import { authSignInEmailRequestSchema, authSignUpEmailRequestSchema } from '@workspace/core/apis/better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { tryit } from 'radashi'

const meter = metrics.getMeter('auth.action')

const loginCounter = meter.createCounter('login', {
  description: 'How many times the login action is called',
})

const logoutCounter = meter.createCounter('logout', {
  description: 'How many times the logout action is called',
})

const registerCounter = meter.createCounter('register', {
  description: 'How many times the register action is called',
})

/**
 * Server action to handle user login.
 *
 * @description
 * 1. Save session to database
 * 2. Set an HTTP-only auth cookie
 * 3. Redirect user to home page
 *
 * @returns {Promise<LoginActionResult | void>} Returns error object if login fails (zod error or server error), void if successful (redirects)
 */
export const loginAction = actionClient
  .metadata({ actionName: 'login' })
  .inputSchema(authSignInEmailRequestSchema)
  .action<ActionResult<null>>(async ({ parsedInput }) => {
    const result = await recordSpan({
      name: 'loginAction',
      tracer: trace.getTracer('auth.action'),
      attributes: parsedInput,
      fn: async (span) => {
        loginCounter.add(1)

        // cookie automatically set by plugin nextCookies
        const [error, response] = await tryit(auth.api.signInEmail)({
          headers: await headers(),
          body: {
            email: parsedInput.email,
            password: parsedInput.password,
            callbackURL: '/',
          },
        })

        if (error) {
          return await serverErrorMapper(error, span)
        }

        span.addEvent('Login success', {
          'token': response.token,
          'user.id': response.user.id,
          'user.email': response.user.email,
        })
      },
    })

    if (result) {
      return result
    }

    redirect('/')
  })

/**
 * Server action to handle user register.
 *
 * @description
 * 1. Save session to database
 * 2. Set an HTTP-only auth cookie
 * 3. Redirect user to home page
 *
 * @returns {Promise<LoginActionResult | void>} Returns error object if login fails (zod error or server error), void if successful (redirects)
 */
export const registerAction = actionClient
  .metadata({ actionName: 'register' })
  .inputSchema(authSignUpEmailRequestSchema)
  .action<ActionResult<null>>(async ({ parsedInput }) => {
    const result = await recordSpan({
      name: 'registerAction',
      tracer: trace.getTracer('auth.action'),
      attributes: parsedInput,
      fn: async (span) => {
        registerCounter.add(1)

        // cookie automatically set by plugin nextCookies
        const [error, response] = await tryit(auth.api.signUpEmail)({
          headers: await headers(),
          body: {
            name: parsedInput.name,
            email: parsedInput.email,
            password: parsedInput.password,
            callbackURL: '/',
          },
        })

        if (error) {
          return await serverErrorMapper(error, span)
        }

        span.addEvent('Register success', {
          'user.id': response.user.id,
          'user.email': response.user.email,
        })
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
 * 1. Remove session from database
 * 2. Remove authentication cookie
 * 3. Redirect user to the login page
 *
 * @returns {Promise<void>} Redirects to login page
 */
export const logoutAction = actionClient
  .metadata({ actionName: 'logoutAction' })
  .action(async () => {
    const result = await recordSpan({
      name: 'logoutAction',
      tracer: trace.getTracer('auth.action'),
      fn: async (span) => {
        logoutCounter.add(1)

        const [error, response] = await tryit(auth.api.signOut)({
          headers: await headers(),
        })

        if (error) {
          return await serverErrorMapper(error, span)
        }

        span.addEvent('Logout success', {
          success: response.success,
        })
      },
    })

    if (result) {
      return result
    }

    redirect('/login')
  })
