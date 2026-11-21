import { describe, expect, onTestFinished, test } from "vitest";
import { page } from "vitest/browser";

import { emilySession } from "./support/network";
import { currentPath, renderRoute } from "./support/render-route";

const unknownPath = "/hahahahaha";

const expectNotFoundPage = async () => {
  await expect
    .element(page.getByRole("heading", { level: 1, name: "404" }))
    .toBeVisible();
  await expect.element(page.getByRole("heading", { level: 2 })).toBeVisible();
  await expect.element(page.getByRole("paragraph")).toBeVisible();
};

describe("not found route", () => {
  test("a signed-in person gets a link back to the Home page", async () => {
    await renderRoute(unknownPath, { session: emilySession });

    await expectNotFoundPage();
    await expect
      .element(
        page.getByRole("link", {
          name: /Back to Home page|Kembali ke halaman Home/u,
        })
      )
      .toBeVisible();
  });

  test("a signed-out visitor gets a link back to the Login page", async () => {
    await renderRoute(unknownPath);

    await expectNotFoundPage();
    await expect
      .element(
        page.getByRole("link", {
          name: /Back to Login page|Kembali ke halaman Login/u,
        })
      )
      .toBeVisible();
  });

  test("the link back to the Home page navigates on the client", async () => {
    await renderRoute(unknownPath, { session: emilySession });
    document.documentElement.dataset.noReload = "true";
    onTestFinished(() => {
      delete document.documentElement.dataset.noReload;
    });

    await page
      .getByRole("link", { name: /Back to Home page|Kembali ke halaman Home/u })
      .click();

    await expect.poll(currentPath).toBe("/");
    await expect.element(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(document.documentElement.dataset.noReload).toBe("true");
  });
});
