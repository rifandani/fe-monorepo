/* eslint-disable react/rules-of-hooks */
import { expect } from "@playwright/test";
import { test as base } from "next/experimental/testmode/playwright.js";

import { validUser } from "./_helper";

interface NetworkError {
  url: string;
  method: string;
  status: number;
}
export interface TestOptions {
  user: {
    username: string;
    email: string;
    password: string;
  };
  /** When true, GET document responses with 404 are not treated as network failures (e.g. not-found page tests). */
  allowExpected404: boolean;
}
export const test = base.extend<TestOptions>({
  allowExpected404: [false, { option: true }],
  page: async ({ page, allowExpected404 }, use, testInfo) => {
    /**
     * setup
     */
    const errors: Error[] = [];
    const networkErrors: NetworkError[] = [];
    // listen to exceptions during the test sessions
    page.on("pageerror", (error) => {
      errors.push(error);
    });
    page.on("response", (response) => {
      if (response.status() < 400) {
        return;
      }
      const request = response.request();
      if (
        allowExpected404 &&
        response.status() === 404 &&
        request.method() === "GET" &&
        request.resourceType() === "document"
      ) {
        return;
      }
      networkErrors.push({
        method: request.method(),
        status: response.status(),
        url: response.url(),
      });
    });
    /**
     * actual test
     */
    await use(page);
    /**
     * teardown
     */
    expect(errors).toHaveLength(0);
    if (networkErrors.length > 0) {
      await testInfo.attach("network-errors.json", {
        body: JSON.stringify(networkErrors, null, 2),
        contentType: "application/json",
      });
      throw new Error(
        `Network errors detected: ${networkErrors.length} requests failed. Check the attached network-errors.json`
      );
    }
  },
  user: [
    validUser,
    {
      option: true,
    },
  ],
});
export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
