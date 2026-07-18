import { describe, expect, it } from "vitest";

import { composeTailwindRenderProps, cx } from "./primitive";

describe("composeTailwindRenderProps", () => {
  it("merges fixed tailwind with string className", () => {
    const result = composeTailwindRenderProps("text-red-500", "p-4");
    const resolved = typeof result === "function" ? result({}) : result;
    expect(resolved).toContain("p-4");
    expect(resolved).toContain("text-red-500");
  });

  it("merges when className is a render function", () => {
    const result = composeTailwindRenderProps(
      (v: { active: boolean }) => (v.active ? "bg-blue-500" : "bg-gray-500"),
      "rounded"
    );
    expect(typeof result).toBe("function");
    if (typeof result === "function") {
      expect(result({ active: true })).toContain("bg-blue-500");
      expect(result({ active: true })).toContain("rounded");
    }
  });
});

describe("cx", () => {
  it("merges multiple class values with a trailing className", () => {
    const result = cx("p-2", "m-2", "text-sm");
    const resolved = typeof result === "function" ? result({}) : result;
    expect(resolved).toContain("p-2");
    expect(resolved).toContain("m-2");
    expect(resolved).toContain("text-sm");
  });

  it("accepts a single array argument", () => {
    const result = cx(["flex", "gap-2", "items-center"]);
    const resolved = typeof result === "function" ? result({}) : result;
    expect(resolved).toContain("flex");
    expect(resolved).toContain("gap-2");
  });

  it("supports render function as last argument", () => {
    const result = cx("base", (v: { open: boolean }) =>
      v.open ? "open" : "closed"
    );
    expect(typeof result).toBe("function");
    if (typeof result === "function") {
      expect(result({ open: false })).toContain("closed");
      expect(result({ open: false })).toContain("base");
    }
  });
});
