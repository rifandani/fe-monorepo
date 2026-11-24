import { page } from "vitest/browser";

export const loginForm = () => ({
  usernameInput: page.getByRole("textbox", { name: /username/iu }),
  passwordInput: page.getByRole("textbox", { name: /password/iu }),
  usernameAlert: page.getByText(/username must contain at least/iu),
  passwordAlert: page.getByText(/password must contain at least/iu),
  submitButton: page.getByRole("button", { name: /login|masuk/iu }),
  mutationError: page.getByTestId("mutation-error"),
});
