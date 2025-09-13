/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test'

const username = 'emilys'
const password = 'emilyspass'

interface NetworkError {
  url: string
  method: string
  status: number
}

export interface TestOptions {
  user: { username: string, password: string }
}

export const test = base.extend<TestOptions>({
  page: async ({ page }, use, testInfo) => {
    /**
     * setup
     */
    const errors: Error[] = []
    const networkErrors: NetworkError[] = []

    // listen to exceptions during the test sessions
    page.on('pageerror', (error) => {
      errors.push(error)
    })
    page.on('response', (response) => {
      /**
       * we test the login error response
       */
      const excludedUrls = ['https://dummyjson.com/auth/login']

      if (response.status() >= 400 && !excludedUrls.includes(response.url())) {
        networkErrors.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
        })
      }
    })

    /**
     * actual test
     */
    await use(page)

    /**
     * teardown
     */
    expect(errors).toHaveLength(0)

    if (networkErrors.length > 0) {
      await testInfo.attach('network-errors.json', {
        body: JSON.stringify(networkErrors, null, 2),
        contentType: 'application/json',
      })
      throw new Error(`Network errors detected: ${networkErrors.length} requests failed. Check the attached network-errors.json`)
    }
  },
  user: [
    {
      username,
      password,
    },
    {
      option: true,
    },
  ],
})

export { expect } from '@playwright/test'
export type { Page } from '@playwright/test'
