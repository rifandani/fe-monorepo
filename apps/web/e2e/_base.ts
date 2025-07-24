/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test'
import { test as base } from 'next/experimental/testmode/playwright.js'
import { validUser } from './_helper'

export interface TestOptions {
  user: { username: string, email: string, password: string }
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
    validUser,
    {
      option: true,
    },
  ],
})

export { expect } from '@playwright/test'
