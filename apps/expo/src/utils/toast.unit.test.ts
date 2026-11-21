import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { resolveToastPreset } from "./toast";

const PRESETS = ["default", "success", "error", "warning", "info"] as const;

const unknownPresetArb = fc
  .anything()
  .filter((value) => !PRESETS.some((preset) => preset === value));

describe("resolveToastPreset", () => {
  it("should pass through every known preset", () => {
    for (const preset of PRESETS) {
      const resolved = resolveToastPreset({ preset });

      expect(resolved).toBe(preset);
    }
  });

  it("should fall back to default when customData is absent", () => {
    const resolved = [
      resolveToastPreset(),
      resolveToastPreset(null),
      resolveToastPreset({}),
    ];

    expect(resolved).toEqual(["default", "default", "default"]);
  });

  it("should fall back to default for an unknown preset", () => {
    const resolved = resolveToastPreset({ preset: "bogus" });

    expect(resolved).toBe("default");
  });

  test.prop([unknownPresetArb])(
    "should always fall back to default for a value that is not a preset",
    (preset) => {
      const resolved = resolveToastPreset({ preset });

      expect(resolved).toBe("default");
    }
  );
});
