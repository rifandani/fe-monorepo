/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test'

const username = 'emilys'
const password = 'emilyspass'

export interface TestOptions {
  user: { username: string, password: string }
}

export const test = base.extend<TestOptions>({
  page: async ({ page }, use) => {
    const errors: Error[] = []

    // listen to exceptions during the test sessions
    page.on('pageerror', (error) => {
      errors.push(error)
    })

    await use(page)

    expect(errors).toHaveLength(0)
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
