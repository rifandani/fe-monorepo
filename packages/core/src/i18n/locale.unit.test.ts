import {
  catalogs,
  defaultLocale,
  localeNames,
  locales,
  localeSchema,
  toLocale,
} from "@workspace/core/i18n/locale";
import { Schema } from "effect";
import { describe, expect, it } from "vitest";

describe("locales", () => {
  it("has a name and a catalog for every Locale", () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy();
      expect(Object.keys(catalogs[locale]).length).toBeGreaterThan(0);
    }

    expect(Object.keys(localeNames)).toEqual([...locales]);
    expect(Object.keys(catalogs)).toEqual([...locales]);
  });

  it("includes the default Locale", () => {
    expect(locales).toContain(defaultLocale);
  });
});

describe("localeSchema", () => {
  const decode = Schema.decodeUnknownSync(localeSchema);

  it("accepts each supported Locale", () => {
    for (const locale of locales) {
      expect(decode(locale)).toBe(locale);
    }
  });

  it("rejects an unsupported or malformed value", () => {
    for (const value of ["en-gb", "en-US", "id", "", "fr-fr", 1, null]) {
      expect(() => decode(value)).toThrow();
    }
  });
});

describe("toLocale", () => {
  it("falls back to the default Locale when the tag is missing or empty", () => {
    expect(toLocale()).toBe(defaultLocale);
    expect(toLocale("")).toBe(defaultLocale);
  });

  it("maps English tags to en-us", () => {
    for (const tag of ["en", "en-GB", "en-US", "en-ID", "EN"]) {
      expect(toLocale(tag)).toBe("en-us");
    }
  });

  it("maps Indonesian tags to id-id", () => {
    for (const tag of ["id", "id-ID", "ID-id", "id-Latn-ID"]) {
      expect(toLocale(tag)).toBe("id-id");
    }
  });

  it("falls back to the default Locale for an unknown primary tag", () => {
    for (const tag of ["fr-FR", "ja", "zz-ZZ", "x"]) {
      expect(toLocale(tag)).toBe(defaultLocale);
    }
  });

  it("always returns a supported Locale", () => {
    for (const tag of ["en-GB", "id", "fr", undefined]) {
      expect(locales).toContain(toLocale(tag));
    }
  });
});
