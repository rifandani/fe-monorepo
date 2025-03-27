import { AUTH_COOKIE_NAME } from '@/auth/constants/auth'
import { expect, test } from '@playwright/test'

const validUsername = 'emilys'
const validPassword = 'emilyspass'
const invalidUsername = 'km'
const invalidPassword = '0lelp'
const errorUsername = '1emilys'
const errorPassword = '1emilyspass'

test.describe('authorized', () => {
  test('should redirect back to home page', async ({ page }) => {
    const usernameInput = page.getByRole('textbox', { name: /username/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /login/i })

    await expect(usernameInput).toBeHidden()
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
    const link = page.getByRole('link', { name: /register/i })
    const logo = page.getByLabel('cool nextjs logo').locator('g circle')

    await expect(title).toBeVisible()
    await expect(link).toBeVisible()
    await expect(logo).toBeVisible()
  })

  test('should success to login', async ({ page }) => {
    const usernameInput = page.getByRole('textbox', { name: /username/i })
    const usernameAlert = page.getByRole('alert', { name: /username/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const passwordAlert = page.getByRole('alert', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /login/i })

    // default form state
    await expect(usernameInput).toBeVisible()
    await expect(usernameAlert).toBeHidden()
    await expect(passwordInput).toBeVisible()
    await expect(passwordAlert).toBeHidden()
    await expect(submitBtn).toBeVisible()

    // fill with valid values
    await usernameInput.fill(validUsername)
    await passwordInput.fill(validPassword)
    await expect(usernameAlert).toBeHidden()
    await expect(passwordAlert).toBeHidden()
    await expect(submitBtn).toBeEnabled()

    // after submit, should be redirected to home
    await submitBtn.click()
    await page.waitForURL('')
    await expect(usernameInput).toBeHidden({ timeout: 10_000 })
    await expect(passwordInput).toBeHidden()
    await expect(submitBtn).toBeHidden()
  })

  test('should failed to login', async ({ page }) => {
    const usernameInput = page.getByRole('textbox', { name: /username/i })
    const usernameAlert = page.getByText(/username must contain at least/i)
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const passwordAlert = page.getByText(/password must contain at least/i)
    const errorAlert = page.getByTestId('mutation-error')
    const submitBtn = page.getByRole('button', { name: /login/i })

    // default form state
    await expect(usernameInput).toBeVisible()
    await expect(usernameAlert).toBeHidden()
    await expect(passwordInput).toBeVisible()
    await expect(passwordAlert).toBeHidden()
    await expect(errorAlert).toBeHidden()
    await expect(submitBtn).toBeVisible()

    // fill with invalid form values
    await usernameInput.fill(invalidUsername)
    await passwordInput.fill(invalidPassword)
    await expect(usernameAlert).toBeVisible()
    await expect(passwordAlert).toBeVisible()
    await expect(submitBtn).toBeDisabled()

    // fill with valid form values, but not valid as request payload
    await usernameInput.fill(errorUsername)
    await passwordInput.fill(errorPassword)
    await expect(usernameAlert).toBeHidden()
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
