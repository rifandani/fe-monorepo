import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import { emilySession } from "./support/network";
import { currentPath, renderRoute } from "./support/render-route";

describe("home route", () => {
  test("a signed-in person sees the title and the welcome message", async () => {
    await renderRoute("/", { session: emilySession });

    await expect.element(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.element(page.getByRole("heading", { level: 2 })).toBeVisible();
  });

  test("a signed-out visitor goes to the Login page", async () => {
    await renderRoute("/");

    await expect.poll(currentPath).toBe("/login");
    await expect
      .element(page.getByRole("textbox", { name: /username/iu }))
      .toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: /password/iu }))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: /login|masuk/iu }))
      .toBeVisible();
  });
});
