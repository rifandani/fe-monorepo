import { describe, expect, it } from "vitest";

import { resolveDeviceLocale } from "./i18n";

describe("resolveDeviceLocale", () => {
  it("falls back to en-us when tag is missing", () => {
    expect(resolveDeviceLocale()).toBe("en-us");
  });

  it("maps English tags to en-us", () => {
    expect(resolveDeviceLocale("en")).toBe("en-us");
    expect(resolveDeviceLocale("en-GB")).toBe("en-us");
    expect(resolveDeviceLocale("en-US")).toBe("en-us");
  });

  it("maps Indonesian tags to id-id", () => {
    expect(resolveDeviceLocale("id")).toBe("id-id");
    expect(resolveDeviceLocale("id-ID")).toBe("id-id");
  });

  it("falls back to en-us for unknown primary tags", () => {
    expect(resolveDeviceLocale("fr-FR")).toBe("en-us");
    expect(resolveDeviceLocale("ja")).toBe("en-us");
  });
});
