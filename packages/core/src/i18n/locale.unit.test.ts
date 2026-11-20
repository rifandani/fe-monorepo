import { fc, test } from "@fast-check/vitest";
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

// Helpers

const decode = Schema.decodeUnknownSync(localeSchema);

/** A language tag whose primary subtag is `primary`, in any letter case, with any rest. */
const tagWithPrimaryArb = (primary: string) =>
  fc
    .tuple(fc.mixedCase(fc.constant(primary)), fc.string())
    .map(([written, rest]) => `${written}-${rest}`);

describe("locales", () => {
  it("should have a name and a catalog for every Locale", () => {
    // Act
    const names = Object.keys(localeNames);
    const catalogKeys = Object.keys(catalogs);

    // Assert
    expect(names).toEqual([...locales]);
    expect(catalogKeys).toEqual([...locales]);

    for (const locale of locales) {
      expect(localeNames[locale]).not.toBe("");
      expect(Object.keys(catalogs[locale]).length).toBeGreaterThan(0);
    }
  });

  it("should include the default Locale", () => {
    // Assert
    expect(locales).toContain(defaultLocale);
  });
});

describe("localeSchema", () => {
  it("should accept each supported Locale", () => {
    for (const locale of locales) {
      // Act
      const decoded = decode(locale);

      // Assert
      expect(decoded).toBe(locale);
    }
  });

  it("should reject an unsupported or malformed value", () => {
    // Arrange
    const values = ["en-gb", "en-US", "id", "", "fr-fr", 1, null];

    for (const value of values) {
      // Act
      const act = () => decode(value);

      // Assert
      expect(act).toThrow();
    }
  });
});

describe("toLocale", () => {
  it("should fall back to the default Locale when the tag is missing or empty", () => {
    // Act
    const missing = toLocale();
    const empty = toLocale("");

    // Assert
    expect(missing).toBe(defaultLocale);
    expect(empty).toBe(defaultLocale);
  });

  it("should map English tags to en-us", () => {
    // Arrange
    const tags = ["en", "en-GB", "en-US", "en-ID", "EN"];

    // Act
    const mapped = tags.map((tag) => toLocale(tag));

    // Assert
    expect(new Set(mapped)).toEqual(new Set(["en-us"]));
  });

  it("should map Indonesian tags to id-id", () => {
    // Arrange
    const tags = ["id", "id-ID", "ID-id", "id-Latn-ID"];

    // Act
    const mapped = tags.map((tag) => toLocale(tag));

    // Assert
    expect(new Set(mapped)).toEqual(new Set(["id-id"]));
  });

  it("should fall back to the default Locale for an unknown primary tag", () => {
    // Arrange
    const tags = ["fr-FR", "ja", "zz-ZZ", "x"];

    // Act
    const mapped = tags.map((tag) => toLocale(tag));

    // Assert
    expect(new Set(mapped)).toEqual(new Set([defaultLocale]));
  });

  test.prop([fc.option(fc.string(), { nil: undefined })])(
    "should always return a supported Locale",
    (tag) => {
      // Act
      const locale = toLocale(tag);

      // Assert
      expect(locales).toContain(locale);
    }
  );

  test.prop([tagWithPrimaryArb("en")])(
    "should always map a tag whose primary subtag is en to en-us",
    (tag) => {
      // Act
      const locale = toLocale(tag);

      // Assert
      expect(locale).toBe("en-us");
    }
  );

  test.prop([tagWithPrimaryArb("id")])(
    "should always map a tag whose primary subtag is id to id-id",
    (tag) => {
      // Act
      const locale = toLocale(tag);

      // Assert
      expect(locale).toBe("id-id");
    }
  );
});
