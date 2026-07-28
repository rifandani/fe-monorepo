import { describe, expect, it } from "vitest";

import { fieldErrorMessage } from "./field-error-message";

describe("fieldErrorMessage", () => {
  it("reads string onChange", () => {
    expect(fieldErrorMessage({ onChange: "required" })).toBe("required");
  });

  it("reads first string in onChange array", () => {
    expect(fieldErrorMessage({ onChange: ["a", "b"] })).toBe("a");
  });

  it("reads message from issue objects", () => {
    expect(fieldErrorMessage({ onChange: [{ message: "too short" }] })).toBe(
      "too short"
    );
  });

  it("falls back to onSubmit then onServer", () => {
    expect(fieldErrorMessage({ onSubmit: "submit err" })).toBe("submit err");
    expect(fieldErrorMessage({ onServer: "server err" })).toBe("server err");
  });

  it("returns undefined when empty", () => {
    expect(fieldErrorMessage({})).toBeUndefined();
  });
});
