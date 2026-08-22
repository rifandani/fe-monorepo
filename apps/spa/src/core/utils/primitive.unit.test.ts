import { describe, expect, it } from "vitest";

import { cx } from "./primitive";

/**
 * `cx` returns `string | ((v: T) => string)` because the render-prop form is
 * decided by its last argument. Every case below passes one, so the result is a
 * render function; the predicate proves that at runtime instead of asserting it.
 */
const isRenderFn = <T>(
  value: string | ((v: T) => string)
): value is (v: T) => string => typeof value === "function";

const renderFn = <T>(value: string | ((v: T) => string)) => {
  expect(isRenderFn(value)).toBe(true);
  if (!isRenderFn(value)) {
    throw new Error("cx did not return a render function");
  }
  return value;
};

describe("cx", () => {
  it("returns a function that merges class names and resolves conflicts", () => {
    const className = renderFn(cx("p-2", "p-4"));
    expect(className({})).toBe("p-4");
  });

  it("accepts a single array of args", () => {
    const className = renderFn(cx(["text-sm", "font-bold", undefined]));
    expect(className({})).toBe("text-sm font-bold");
  });

  it("merges dynamic class names from a render prop", () => {
    const className = renderFn(
      cx("base", (v: { active: boolean }) => (v.active ? "active" : "idle"))
    );

    expect(className({ active: true })).toBe("base active");
    expect(className({ active: false })).toBe("base idle");
  });
});
