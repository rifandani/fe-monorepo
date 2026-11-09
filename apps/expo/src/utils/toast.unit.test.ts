import { describe, expect, it } from "vitest";

import { resolveToastPreset } from "./toast";

describe("resolveToastPreset", () => {
  it("passes through every known preset", () => {
    for (const preset of [
      "default",
      "success",
      "error",
      "warning",
      "info",
    ] as const) {
      expect(resolveToastPreset({ preset })).toBe(preset);
    }
  });

  it("falls back to default when customData is absent", () => {
    expect(resolveToastPreset()).toBe("default");
    expect(resolveToastPreset(null)).toBe("default");
    expect(resolveToastPreset({})).toBe("default");
  });

  it("falls back to default for an unrecognised preset", () => {
    expect(resolveToastPreset({ preset: "bogus" })).toBe("default");
  });
});
