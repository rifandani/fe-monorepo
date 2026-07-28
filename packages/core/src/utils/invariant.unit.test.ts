import { invariant as invariantImpl } from "@workspace/core/utils/invariant";
import { describe, expect, it, vi } from "vitest";

// TS2775: a statement-level call to an `asserts condition` function requires its
// target to carry an explicit type annotation, which an import binding cannot.
// Aliasing through an annotated const keeps the narrowing assertion callable.
const invariant: typeof invariantImpl = invariantImpl;

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

  it("strips the message in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    // `isProduction` is read at module load, so the module must be re-imported
    const prodModule = await import("@workspace/core/utils/invariant");
    const prodInvariant: typeof invariantImpl = prodModule.invariant;

    expect(() => prodInvariant(false, "secret detail")).toThrow(
      /^Invariant failed$/u
    );
  });
});
