import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { resolveToastPreset } from "./toast";

// Helpers

const PRESETS = ["default", "success", "error", "warning", "info"] as const;

/** A value that is not one of the presets. */
const unknownPresetArb = fc
  .anything()
  .filter((value) => !PRESETS.some((preset) => preset === value));

describe("resolveToastPreset", () => {
  it("should pass through every known preset", () => {
    for (const preset of PRESETS) {
      // Act
      const resolved = resolveToastPreset({ preset });

      // Assert
      expect(resolved).toBe(preset);
    }
  });

  it("should fall back to default when customData is absent", () => {
    // Act
    const resolved = [
      resolveToastPreset(),
      resolveToastPreset(null),
      resolveToastPreset({}),
    ];

    // Assert
    expect(resolved).toEqual(["default", "default", "default"]);
  });

  it("should fall back to default for an unknown preset", () => {
    // Act
    const resolved = resolveToastPreset({ preset: "bogus" });

    // Assert
    expect(resolved).toBe("default");
  });

  test.prop([unknownPresetArb])(
    "should always fall back to default for a value that is not a preset",
    (preset) => {
      // Act
      const resolved = resolveToastPreset({ preset });

      // Assert
      expect(resolved).toBe("default");
    }
  );
});
