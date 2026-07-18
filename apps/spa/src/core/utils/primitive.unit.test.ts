import { describe, expect, it } from "vitest";

import { cx } from "./primitive";

describe("cx", () => {
  it("returns a function that merges class names and resolves conflicts", () => {
    const className = cx("p-2", "p-4") as (v: unknown) => string;
    expect(typeof className).toBe("function");
    expect(className({})).toBe("p-4");
  });

  it("accepts a single array of args", () => {
    const className = cx(["text-sm", "font-bold", undefined]) as (
      v: unknown
    ) => string;
    expect(className({})).toBe("text-sm font-bold");
  });

  it("merges dynamic class names from a render prop", () => {
    const className = cx("base", (v: { active: boolean }) =>
      v.active ? "active" : "idle"
    ) as (v: { active: boolean }) => string;

    expect(className({ active: true })).toBe("base active");
    expect(className({ active: false })).toBe("base idle");
  });
});
