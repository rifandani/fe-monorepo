import { expect, test } from './_base'

const invalidEmail = 'va'
const invalidPassword = 'ab' // min 8
const invalidName = 'ab' // min 3

test.describe('authorized', () => {
  test('should redirect to home', async ({ page }) => {
    await page.goto('/register')
    await page.waitForURL(url => new URL(url).pathname === '/')
    const title = page.getByRole('heading', { level: 1 })
    await expect(title).toBeVisible()
    await expect(title).toContainText(/Home|Beranda/i)
  })
})

test.describe('unauthorized', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should have title, login link, and form', async ({ page }) => {
    const title = page.getByRole('heading', { level: 1 })
    const link = page.getByRole('link', { name: /login|masuk/i })
    const nameInput = page.getByRole('textbox', { name: /name/i })
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /register|daftar/i })

    await expect(title).toBeVisible()
    await expect(link).toBeVisible()
    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitBtn).toBeVisible()
  })

  test('should show validation errors for invalid fields', async ({ page }) => {
    const nameInput = page.getByRole('textbox', { name: /name/i })
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /register|daftar/i })

    await nameInput.fill(invalidName)
    await emailInput.fill(invalidEmail)
    await passwordInput.fill(invalidPassword)

    await expect(submitBtn).toBeDisabled()
  })

  test('should enable submit when form is valid', async ({ page }) => {
    const nameInput = page.getByRole('textbox', { name: /name/i })
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /register|daftar/i })

    await nameInput.fill('Test User')
    await emailInput.fill('newuser@example.com')
    await passwordInput.fill('password123')

    await expect(submitBtn).toBeEnabled()
  })
})
