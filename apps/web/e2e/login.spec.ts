import { expect, test } from './_base'
import { validUser } from './_helper'
import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'

const invalidEmail = 'va'
const invalidPassword = 'vaand'
const errorEmail = '1vaandani@gmail.com'
const errorPassword = '1vaandani'

test.describe('authorized', () => {
  test('should redirect back to home page', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /login|masuk/i })

    await expect(emailInput).toBeHidden()
    await expect(passwordInput).toBeHidden()
    await expect(submitBtn).toBeHidden()
  })
})

test.describe('unauthorized', () => {
  // reset storage state in a test file to avoid authentication that was set up for the whole project
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should have title, register here link, react logo', async ({
    page,
  }) => {
    const title = page.getByRole('heading', { level: 1 })
    const link = page.getByRole('link', { name: /register|daftar/i })
    const logo = page.getByLabel('cool nextjs logo').locator('g circle')

    await expect(title).toBeVisible()
    await expect(link).toBeVisible()
    await expect(logo).toBeVisible()
  })

  test('should success to login', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const emailAlert = page.getByRole('alert', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const passwordAlert = page.getByRole('alert', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /login|masuk/i })

    // default form state
    await expect(emailInput).toBeVisible()
    await expect(emailAlert).toBeHidden()
    await expect(passwordInput).toBeVisible()
    await expect(passwordAlert).toBeHidden()
    await expect(submitBtn).toBeVisible()

    // fill with valid values
    await emailInput.fill(validUser.email)
    await passwordInput.fill(validUser.password)
    await expect(emailAlert).toBeHidden()
    await expect(passwordAlert).toBeHidden()
    await expect(submitBtn).toBeEnabled()

    // after submit, should be redirected to home
    await submitBtn.click()
    await page.waitForURL('')
    await expect(emailInput).toBeHidden({ timeout: 10_000 })
    await expect(passwordInput).toBeHidden()
    await expect(submitBtn).toBeHidden()
  })

  test('should failed to login', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const emailAlert = page.getByText(/invalid email address/i)
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const passwordAlert = page.getByText(/too small: expected string to have >=8 characters/i)
    const errorAlert = page.getByTestId('mutation-error')
    const submitBtn = page.getByRole('button', { name: /login|masuk/i })

    // default form state
    await expect(emailInput).toBeVisible()
    await expect(emailAlert).toBeHidden()
    await expect(passwordInput).toBeVisible()
    await expect(passwordAlert).toBeHidden()
    await expect(errorAlert).toBeHidden()
    await expect(submitBtn).toBeVisible()

    // fill with invalid form values
    await emailInput.fill(invalidEmail)
    await passwordInput.fill(invalidPassword)
    await expect(emailAlert).toBeVisible()
    await expect(passwordAlert).toBeVisible()
    await expect(submitBtn).toBeDisabled()

    // fill with valid form values, but not valid as request payload
    await emailInput.fill(errorEmail)
    await passwordInput.fill(errorPassword)
    await expect(emailAlert).toBeHidden()
    await expect(passwordAlert).toBeHidden()
    await expect(submitBtn).toBeEnabled()

    // assert that NEXT_AUTH cookie is not set and error alert is visible
    await submitBtn.click()
    const cookies = await page.context().cookies()
    const appUserCookie = cookies.find(cookie => cookie.name === AUTH_COOKIE_NAME)
    expect(appUserCookie).toBeUndefined()
    await expect(errorAlert).toBeVisible()
  })
})
