import { describe, expect, it } from "vitest";

import { composeTailwindRenderProps, cx } from "./primitive";

/**
 * Both helpers return `string | ((v: T) => string)`: the render-prop form only
 * appears when the caller passes one. The predicate names that branch so the
 * tests can assert on either shape.
 */
const isRenderFn = <T>(
  value: string | ((v: T) => string)
): value is (v: T) => string => typeof value === "function";

describe("composeTailwindRenderProps", () => {
  it("merges fixed tailwind with string className", () => {
    const result = composeTailwindRenderProps("text-red-500", "p-4");
    const resolved = isRenderFn(result) ? result({}) : result;
    expect(resolved).toContain("p-4");
    expect(resolved).toContain("text-red-500");
  });

  it("merges when className is a render function", () => {
    const result = composeTailwindRenderProps(
      (v: { active: boolean }) => (v.active ? "bg-blue-500" : "bg-gray-500"),
      "rounded"
    );
    expect(isRenderFn(result)).toBe(true);
    if (isRenderFn(result)) {
      expect(result({ active: true })).toContain("bg-blue-500");
      expect(result({ active: true })).toContain("rounded");
    }
  });
});

describe("cx", () => {
  it("merges multiple class values with a trailing className", () => {
    const result = cx("p-2", "m-2", "text-sm");
    const resolved = isRenderFn(result) ? result({}) : result;
    expect(resolved).toContain("p-2");
    expect(resolved).toContain("m-2");
    expect(resolved).toContain("text-sm");
  });

  it("accepts a single array argument", () => {
    const result = cx(["flex", "gap-2", "items-center"]);
    const resolved = isRenderFn(result) ? result({}) : result;
    expect(resolved).toContain("flex");
    expect(resolved).toContain("gap-2");
  });

  // The array form must *unwrap* before popping the render prop. Asserting on the
  // merged string cannot show that: twMerge flattens a nested array to the same
  // output, so `toContain` passes either way. A render function as the array's last
  // element diverges observably — unwrapped it becomes the className (result is a
  // function), un-unwrapped the whole array is the className (result is a string).
  it("unwraps a single array argument before popping the render prop", () => {
    const result = cx<{ on: boolean }>([
      "base",
      "p-2",
      (v: { on: boolean }) => (v.on ? "on" : "off"),
    ]);
    expect(isRenderFn(result)).toBe(true);
    if (isRenderFn(result)) {
      expect(result({ on: true })).toContain("base");
      expect(result({ on: true })).toContain("p-2");
      expect(result({ on: true })).toContain("on");
      expect(result({ on: false })).toContain("off");
    }
  });

  // A lone non-array argument must NOT take the unwrap branch: `args[0]` is a string,
  // and unwrapping it would leave a string where an array is expected.
  it("does not unwrap a single non-array argument", () => {
    const result = cx("solo-class");
    const resolved = isRenderFn(result) ? result({}) : result;
    expect(resolved).toBe("solo-class");
  });

  // The `args.length === 1` half of the guard matters on its own: an array is a legal
  // ClassNameValue, so `cx([...], render)` passes one *among several* args and must
  // NOT be unwrapped. Without the length check the trailing argument is discarded.
  it("does not unwrap an array that is one of several arguments", () => {
    const result = cx(["flex", "gap-2"], "text-sm");
    const resolved = isRenderFn(result) ? result({}) : result;
    expect(resolved).toContain("flex");
    expect(resolved).toContain("gap-2");
    expect(resolved).toContain("text-sm");
  });

  it("supports render function as last argument", () => {
    const result = cx("base", (v: { open: boolean }) =>
      v.open ? "open" : "closed"
    );
    expect(isRenderFn(result)).toBe(true);
    if (isRenderFn(result)) {
      expect(result({ open: false })).toContain("closed");
      expect(result({ open: false })).toContain("base");
    }
  });
});
