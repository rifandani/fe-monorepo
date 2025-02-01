'use server'

import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'
import { http } from '@/core/services/http.service'
import { actionClient } from '@/core/utils/action'
import { authLoginRequestSchema, authRepositories } from '@workspace/core/apis/auth.api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { zfd } from 'zod-form-data'
import { fromZodError } from 'zod-validation-error'

interface LoginActionResult {
  data: null
  error: string
}

const authLoginRequestFormDataSchema = zfd.formData({
  username: zfd.text(authLoginRequestSchema.shape.username),
  password: zfd.text(authLoginRequestSchema.shape.password),
  expiresInMins: zfd.numeric(authLoginRequestSchema.shape.expiresInMins),
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
export const loginStateAction = actionClient
  .schema(authLoginRequestFormDataSchema)
  .stateAction<LoginActionResult>(async ({ parsedInput }) => {
    try {
      // request for user login
      const response = await authRepositories(http).login({ json: parsedInput })

      // set auth cookies
      const cookie = await cookies()
      cookie.set(AUTH_COOKIE_NAME, btoa(JSON.stringify(response)), {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 1, // 1 days
        path: '/',
      })
    }
    catch (error) {
      if (error instanceof ZodError)
        return { data: null, error: fromZodError(error).message }

      return { data: null, error: (error as Error).message }
    }

    // redirect to home when success (INFO: we can't use redirect in try catch block, because redirect will throw an error object)
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
  .action(async () => {
    // clear auth cookies
    const cookie = await cookies()
    cookie.delete(AUTH_COOKIE_NAME)

    // redirect to login page when success
    redirect('/login')
  })
