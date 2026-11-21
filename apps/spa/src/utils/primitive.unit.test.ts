import { describe, expect, it } from "vitest";

import { cx } from "./primitive";

const isRenderFn = <T>(
  value: string | ((v: T) => string)
): value is (v: T) => string => typeof value === "function";

const renderFn = <T>(value: string | ((v: T) => string)) => {
  if (!isRenderFn(value)) {
    throw new Error("cx did not return a render function");
  }

  return value;
};

const byState = (v: { active: boolean }) => (v.active ? "active" : "idle");

describe("cx", () => {
  it("should return a function that merges class names and resolves conflicts", () => {
    const className = renderFn(cx("p-2", "p-4"));

    expect(className({})).toBe("p-4");
  });

  it("should accept a single array of args", () => {
    const className = renderFn(cx(["text-sm", "font-bold", undefined]));

    expect(className({})).toBe("text-sm font-bold");
  });

  it("should merge the class names that a render prop returns", () => {
    const className = renderFn(cx("base", byState));

    expect(className({ active: true })).toBe("base active");
    expect(className({ active: false })).toBe("base idle");
  });
});
