import { fc, test } from "@fast-check/vitest";
import { invariant as invariantImpl } from "@workspace/core/utils/invariant";
import { describe, expect, it, vi } from "vitest";

// Helpers

// TS2775: a statement-level call to an `asserts condition` function requires its
// target to carry an explicit type annotation, which an import binding cannot.
// Aliasing through an annotated const keeps the narrowing assertion callable.
const invariant: typeof invariantImpl = invariantImpl;

/** Every falsy value JavaScript has. */
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
    // Arrange
    const value: string | null = "Ada";

    // Act
    invariant(value, "expected value");

    // Assert
    expect(value).toBe("Ada");
  });

  it("should throw with the message when the condition is falsy", () => {
    // Arrange
    const condition = false;

    // Act
    const act = () => {
      invariant(condition, "boom");
    };

    // Assert
    expect(act).toThrow(new Error("Invariant failed: boom"));
  });

  it("should call a lazy message function", () => {
    // Arrange
    const condition = 0;

    // Act
    const act = () => {
      invariant(condition, () => "lazy");
    };

    // Assert
    expect(act).toThrow(new Error("Invariant failed: lazy"));
  });

  it("should throw the prefix only when the message is omitted", () => {
    // Arrange
    const condition = false;

    // Act
    const act = () => {
      invariant(condition);
    };

    // Assert
    expect(act).toThrow(new Error("Invariant failed"));
  });

  it("should strip the message in production", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    // `isProduction` is read at module load, so the module must be re-imported
    const prodModule = await import("@workspace/core/utils/invariant");
    const prodInvariant: typeof invariantImpl = prodModule.invariant;

    // Act
    const act = () => {
      prodInvariant(false, "secret detail");
    };

    // Assert
    expect(act).toThrow(new Error("Invariant failed"));
  });

  test.prop([fc.anything().filter(Boolean), fc.string()])(
    "should never throw for a truthy condition",
    (condition, message) => {
      // Act
      const act = () => {
        // oxlint-disable-next-line typescript/strict-boolean-expressions -- truthiness of any value is the contract under test
        invariant(condition, message);
      };

      // Assert
      expect(act).not.toThrow();
    }
  );

  test.prop([falsyArb, fc.string({ minLength: 1 })])(
    "should always throw the prefixed message for a falsy condition",
    (condition, message) => {
      // Act
      const act = () => {
        // oxlint-disable-next-line typescript/strict-boolean-expressions -- truthiness of any value is the contract under test
        invariant(condition, message);
      };

      // Assert
      expect(act).toThrow(new Error(`Invariant failed: ${message}`));
    }
  );
});
