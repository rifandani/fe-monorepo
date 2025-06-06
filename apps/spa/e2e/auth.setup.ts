import { expect, test } from './_base'

test('auth setup', async ({ page }) => {
  // when we're not authenticated, the app redirects to the login page
  await page.goto('')

  const usernameInput = page.getByRole('textbox', { name: /username/i })
  const passwordInput = page.getByRole('textbox', { name: /password/i })
  const submitBtn = page.getByRole('button', { name: /login|masuk/i })

  await usernameInput.fill('emilys')
  await passwordInput.fill('emilyspass')
  await submitBtn.click()

  await page.waitForURL('')
  await expect(usernameInput).toBeHidden()
  await expect(passwordInput).toBeHidden()
  await expect(submitBtn).toBeHidden()

  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
