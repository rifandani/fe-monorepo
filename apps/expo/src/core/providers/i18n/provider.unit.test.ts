import { describe, expect, it, vi } from "vitest";

import { resolveDeviceLocale } from "./provider";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageTag: "en-US" }],
}));

vi.mock("@/core/providers/i18n/context", () => ({
  TranslationProvider: ({ children }: { children: unknown }) => children,
}));

vi.mock("@workspace/core/libs/i18n/locales/en-US", () => ({
  default: {},
}));

vi.mock("@workspace/core/libs/i18n/locales/id-ID", () => ({
  default: {},
}));

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
