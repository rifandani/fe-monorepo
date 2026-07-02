import { expect, test } from "./_base";

const invalidEmail = "va";
// min 8
const invalidPassword = "ab";
// min 3
const invalidName = "ab";
test.describe("authorized", () => {
  test("should redirect to home", async ({ page }) => {
    await page.goto("/register");
    await page.waitForURL((url) => new URL(url).pathname === "/");
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toBeVisible();
    await expect(title).toContainText(/Home|Beranda/iu);
  });
});
test.describe("unauthorized", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });
  test("should have title, login link, and form", async ({ page }) => {
    const title = page.getByRole("heading", { level: 1 });
    const link = page.getByRole("link", { name: /login|masuk/iu });
    const nameInput = page.getByRole("textbox", { name: /name/iu });
    const emailInput = page.getByRole("textbox", { name: /email/iu });
    const passwordInput = page.getByRole("textbox", { name: /password/iu });
    const submitBtn = page.getByRole("button", { name: /register|daftar/iu });
    await expect(title).toBeVisible();
    await expect(link).toBeVisible();
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });
  test("should show validation errors for invalid fields", async ({ page }) => {
    const nameInput = page.getByRole("textbox", { name: /name/iu });
    const emailInput = page.getByRole("textbox", { name: /email/iu });
    const passwordInput = page.getByRole("textbox", { name: /password/iu });
    const submitBtn = page.getByRole("button", { name: /register|daftar/iu });
    await nameInput.fill(invalidName);
    await emailInput.fill(invalidEmail);
    await passwordInput.fill(invalidPassword);
    await expect(submitBtn).toBeDisabled();
  });
  test("should enable submit when form is valid", async ({ page }) => {
    const nameInput = page.getByRole("textbox", { name: /name/iu });
    const emailInput = page.getByRole("textbox", { name: /email/iu });
    const passwordInput = page.getByRole("textbox", { name: /password/iu });
    const submitBtn = page.getByRole("button", { name: /register|daftar/iu });
    await nameInput.fill("Test User");
    await emailInput.fill("newuser@example.com");
    await passwordInput.fill("password123");
    await expect(submitBtn).toBeEnabled();
  });
});
