import {
  gigabyteMultiplier,
  indoTimezone,
  kilobyteMultiplier,
  megabyteMultiplier,
  modes,
  themes,
} from "@workspace/core/constants/core";
import { describe, expect, it } from "vitest";

describe("core constants", () => {
  it("exposes theme list and modes map", () => {
    expect(themes).toEqual(["system", "light", "dark"]);
    expect(modes).toEqual({ system: "system", light: "light", dark: "dark" });
  });

  it("exposes byte multipliers and timezones", () => {
    expect(kilobyteMultiplier).toBe(1024);
    expect(megabyteMultiplier).toBe(1024 ** 2);
    expect(gigabyteMultiplier).toBe(1024 ** 3);
    expect(indoTimezone).toEqual(["WIB", "WITA", "WIT"]);
  });
});
