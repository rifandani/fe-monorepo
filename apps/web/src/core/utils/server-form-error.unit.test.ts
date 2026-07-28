import { describe, expect, it } from "vitest";

import { serverFormError } from "./server-form-error";

describe("serverFormError", () => {
  it("exposes the message as both a form-level onServer error and an errors entry", () => {
    const values = { email: "user@example.com", password: "secret" };

    expect(serverFormError(values, "Invalid credentials")).toEqual({
      errorMap: { onServer: "Invalid credentials" },
      errors: ["Invalid credentials"],
      values,
    });
  });

  it("preserves the submitted values so the form can re-render them", () => {
    const values = { email: "keep@example.com" };

    expect(serverFormError(values, "boom").values).toBe(values);
  });
});
