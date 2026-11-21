import { fc, test } from "@fast-check/vitest";
import { invariant as invariantImpl } from "@workspace/core/utils/invariant";
import { describe, expect, it, vi } from "vitest";

const invariant: typeof invariantImpl = invariantImpl;

const falsyArb = fc.constantFrom(
  false,
  0,
  -0,
  0n,
  "",
  null,
  undefined,
  Number.NaN
);

describe("invariant", () => {
  it("should not throw when the condition is truthy", () => {
    const value: string | null = "Ada";

    invariant(value, "expected value");

    expect(value).toBe("Ada");
  });

  it("should throw with the message when the condition is falsy", () => {
    const condition = false;

    const act = () => {
      invariant(condition, "boom");
    };

    expect(act).toThrow(new Error("Invariant failed: boom"));
  });

  it("should call a lazy message function", () => {
    const condition = 0;

    const act = () => {
      invariant(condition, () => "lazy");
    };

    expect(act).toThrow(new Error("Invariant failed: lazy"));
  });

  it("should throw the prefix only when the message is omitted", () => {
    const condition = false;

    const act = () => {
      invariant(condition);
    };

    expect(act).toThrow(new Error("Invariant failed"));
  });

  it("should strip the message in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const prodModule = await import("@workspace/core/utils/invariant");
    const prodInvariant: typeof invariantImpl = prodModule.invariant;

    const act = () => {
      prodInvariant(false, "secret detail");
    };

    expect(act).toThrow(new Error("Invariant failed"));
  });

  test.prop([fc.anything().filter(Boolean), fc.string()])(
    "should never throw for a truthy condition",
    (condition, message) => {
      const act = () => {
        // oxlint-disable-next-line typescript/strict-boolean-expressions -- truthiness of any value is the contract under test
        invariant(condition, message);
      };

      expect(act).not.toThrow();
    }
  );

  test.prop([falsyArb, fc.string({ minLength: 1 })])(
    "should always throw the prefixed message for a falsy condition",
    (condition, message) => {
      const act = () => {
        // oxlint-disable-next-line typescript/strict-boolean-expressions -- truthiness of any value is the contract under test
        invariant(condition, message);
      };

      expect(act).toThrow(new Error(`Invariant failed: ${message}`));
    }
  );
});
