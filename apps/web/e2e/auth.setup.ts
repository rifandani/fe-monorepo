import { expect, test } from './_base'
import { validUser } from './_helper'

test('auth setup', async ({ page }) => {
  // when we're not authenticated, the app redirects to the login page
  await page.goto('/login')

  const emailInput = page.getByRole('textbox', { name: /email/i })
  const passwordInput = page.getByRole('textbox', { name: /password/i })
  const submitBtn = page.getByRole('button', { name: /login|masuk/i })

  await emailInput.fill(validUser.email)
  await passwordInput.fill(validUser.password)
  await submitBtn.click()

  await page.waitForURL('')
  await expect(emailInput).toBeHidden({ timeout: 20_000 })
  await expect(passwordInput).toBeHidden({ timeout: 20_000 })
  await expect(submitBtn).toBeHidden({ timeout: 20_000 })

  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
