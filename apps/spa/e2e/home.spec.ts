import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('authorized', () => {
  test('should have title', async ({ page }) => {
    const title = page.getByRole('heading', { level: 1 })

    await expect(title).toBeVisible()
  })
})

test.describe('unauthorized', () => {
  // reset storage state in a test file to avoid authentication that was set up for the whole project
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should redirect back to /login', async ({ page }) => {
    const usernameInput = page.getByRole('textbox', { name: /username/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i })
    const submitBtn = page.getByRole('button', { name: /login/i })

    await page.waitForURL(/\/login/)
    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitBtn).toBeVisible()
  })
})
