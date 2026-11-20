import { describe, expect, it } from "vitest";

import { cx } from "./primitive";

// Helpers

/**
 * `cx` returns `string | ((v: T) => string)` because the render-prop form is
 * decided by its last argument. Every case below passes one, so the result is a
 * render function; the predicate proves that at runtime instead of asserting it.
 */
const isRenderFn = <T>(
  value: string | ((v: T) => string)
): value is (v: T) => string => typeof value === "function";

const renderFn = <T>(value: string | ((v: T) => string)) => {
  if (!isRenderFn(value)) {
    throw new Error("cx did not return a render function");
  }

  return value;
};

/** A render prop that names the active state. */
const byState = (v: { active: boolean }) => (v.active ? "active" : "idle");

describe("cx", () => {
  it("should return a function that merges class names and resolves conflicts", () => {
    // Act
    const className = renderFn(cx("p-2", "p-4"));

    // Assert
    expect(className({})).toBe("p-4");
  });

  it("should accept a single array of args", () => {
    // Act
    const className = renderFn(cx(["text-sm", "font-bold", undefined]));

    // Assert
    expect(className({})).toBe("text-sm font-bold");
  });

  it("should merge the class names that a render prop returns", () => {
    // Act
    const className = renderFn(cx("base", byState));

    // Assert
    expect(className({ active: true })).toBe("base active");
    expect(className({ active: false })).toBe("base idle");
  });
});
