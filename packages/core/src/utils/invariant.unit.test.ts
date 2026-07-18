import { invariant } from "@workspace/core/utils/invariant";
import { describe, expect, it } from "vitest";

describe("invariant", () => {
  it("does not throw when condition is truthy", () => {
    expect(() => invariant(true, "ok")).not.toThrow();
    const value: string | null = "Ada";
    invariant(value, "expected value");
    expect(value).toBe("Ada");
  });

  it("throws with message when condition is falsy", () => {
    expect(() => invariant(false, "boom")).toThrow("Invariant failed: boom");
  });

  it("supports lazy message functions", () => {
    expect(() => invariant(0, () => "lazy")).toThrow("Invariant failed: lazy");
  });

  it("throws prefix-only when message omitted", () => {
    expect(() => invariant(false)).toThrow("Invariant failed");
  });
});
