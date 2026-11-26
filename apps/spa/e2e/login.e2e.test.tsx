import { onlineManager } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import { persistence } from "@/lib/layers/persistence";

import { loginForm } from "./support/login-form";
import { api, emily, emilySession, worker } from "./support/network";
import { currentPath, renderRoute } from "./support/render-route";

const invalidUsername = "km";
const invalidPassword = "0lelp";

const wrongUsername = "1emilys";
const wrongPassword = "1emilyspass";

describe("login route", () => {
  test("a signed-in person goes back to the Home page", async () => {
    await renderRoute("/login", { session: emilySession });
    const { usernameInput, passwordInput, submitButton } = loginForm();

    await expect.poll(currentPath).toBe("/");
    await expect.element(usernameInput).not.toBeInTheDocument();
    await expect.element(passwordInput).not.toBeInTheDocument();
    await expect.element(submitButton).not.toBeInTheDocument();
  });

  test("a signed-out visitor sees the title, the register link and the logo", async () => {
    await renderRoute("/login");

    await expect.element(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .element(page.getByRole("link", { name: /register|daftar/iu }))
      .toBeVisible();
    await expect
      .element(page.getByLabelText(/cool react logo/iu))
      .toBeVisible();
  });

  test("valid credentials sign the person in and open the Home page", async () => {
    await renderRoute("/login");

    const {
      usernameInput,
      passwordInput,
      usernameAlert,
      passwordAlert,
      submitButton,
    } = loginForm();

    await expect.element(usernameInput).toBeVisible();
    await expect.element(passwordInput).toBeVisible();
    await expect.element(usernameAlert).not.toBeInTheDocument();
    await expect.element(passwordAlert).not.toBeInTheDocument();
    await expect.element(submitButton).toBeVisible();

    await usernameInput.fill(emily.username);
    await passwordInput.fill(emily.password);
    await expect.element(usernameAlert).not.toBeInTheDocument();
    await expect.element(passwordAlert).not.toBeInTheDocument();
    await expect.element(submitButton).toBeEnabled();

    await submitButton.click();

    await expect.poll(currentPath).toBe("/");
    await expect.element(usernameInput).not.toBeInTheDocument();
    await expect.element(passwordInput).not.toBeInTheDocument();
    await expect.element(submitButton).not.toBeInTheDocument();
  });

  test("invalid and wrong credentials keep the person on the Login page", async () => {
    await renderRoute("/login");

    const {
      usernameInput,
      passwordInput,
      usernameAlert,
      passwordAlert,
      submitButton,
      mutationError,
    } = loginForm();

    await expect.element(usernameInput).toBeVisible();
    await expect.element(passwordInput).toBeVisible();
    await expect.element(usernameAlert).not.toBeInTheDocument();
    await expect.element(passwordAlert).not.toBeInTheDocument();
    await expect.element(mutationError).not.toBeInTheDocument();
    await expect.element(submitButton).toBeVisible();

    await usernameInput.fill(invalidUsername);
    await passwordInput.fill(invalidPassword);
    await expect.element(usernameAlert).toBeVisible();
    await expect.element(passwordAlert).toBeVisible();
    await expect.element(submitButton).toBeDisabled();

    await usernameInput.fill(wrongUsername);
    await passwordInput.fill(wrongPassword);
    await expect.element(usernameAlert).not.toBeInTheDocument();
    await expect.element(passwordAlert).not.toBeInTheDocument();
    await expect.element(submitButton).toBeEnabled();

    await submitButton.click();

    await expect.element(mutationError).toBeVisible();
    expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
  });

  test("an offline login fails at once and shows the network error", async () => {
    onlineManager.setOnline(false);
    worker.use(http.post(api("auth/login"), () => HttpResponse.error()));

    await renderRoute("/login");

    const { usernameInput, passwordInput, submitButton, mutationError } =
      loginForm();

    await usernameInput.fill(emily.username);
    await passwordInput.fill(emily.password);
    await submitButton.click();

    await expect
      .element(mutationError.getByText(/could not connect to the server/iu))
      .toBeVisible();
    expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
  });
});
