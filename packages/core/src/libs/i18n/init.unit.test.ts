import { defineTranslation } from "@workspace/core/libs/i18n/define-translation";
import { initI18n } from "@workspace/core/libs/i18n/init";
import { describe, expect, it } from "vitest";

const translations = {
  "en-us": {
    welcome: "Welcome",
    greeting: defineTranslation("Hello {name}!", {}),
    inbox: defineTranslation("{count:plural}", {
      plural: {
        count: {
          one: "You have {?} message",
          other: "You have {?} messages",
        },
      },
    }),
    ordinal: defineTranslation("{place:plural}", {
      plural: {
        place: {
          one: "{?}st",
          two: "{?}nd",
          other: "{?}th",
          type: "ordinal",
        },
      },
    }),
    unknownPlural: defineTranslation("{count:plural}", {
      plural: {
        // deliberately missing `other`, so `select()` finds nothing to use
        count: { two: "two" } as never,
      },
    }),
    status: defineTranslation("Status: {state:enum}", {
      enum: { state: { active: "Active", archived: "Archived" } },
    }),
    price: defineTranslation("Total {amount:number}", {
      number: { amount: { currency: "USD", style: "currency" } },
    }),
    tags: defineTranslation("Tags: {items:list}", {
      list: { items: { style: "long", type: "conjunction" } },
    }),
    lastLogin: defineTranslation("Last login {at:date}", {
      date: { at: { dateStyle: "short", timeZone: "UTC" } },
    }),
    nested: {
      deep: {
        label: "Deep label",
      },
    },
  },
  "id-id": {
    welcome: "Selamat datang",
  },
} as const;

const setup = (locale = "en-us", fallbackLocale: string | string[] = "en-us") =>
  initI18n({
    locale,
    fallbackLocale,
    translations: translations as never,
  }).t;

describe("initI18n", () => {
  it("translates simple keys for the active locale", () => {
    const { t } = initI18n({
      locale: "en-US",
      fallbackLocale: "en-us",
      translations: translations as never,
    });
    expect(t("welcome" as never)).toBe("Welcome");
  });

  it("falls back to another locale catalog", () => {
    const { t } = initI18n({
      locale: "fr-FR",
      fallbackLocale: "id-id",
      translations: translations as never,
    });
    expect(t("welcome" as never)).toBe("Selamat datang");
  });

  it("substitutes plain params", () => {
    const { t } = initI18n({
      locale: "en-us",
      fallbackLocale: "en-us",
      translations: translations as never,
    });
    expect(t("greeting" as never, { name: "Ada" } as never)).toBe("Hello Ada!");
  });

  it("handles plural substitution", () => {
    const { t } = initI18n({
      locale: "en-us",
      fallbackLocale: "en-us",
      translations: translations as never,
    });
    expect(t("inbox" as never, { count: 1 } as never)).toBe(
      "You have 1 message"
    );
    expect(t("inbox" as never, { count: 3 } as never)).toBe(
      "You have 3 messages"
    );
  });

  it("returns the key when missing everywhere", () => {
    const { t } = initI18n({
      locale: "en-us",
      fallbackLocale: "en-us",
      translations: translations as never,
    });
    expect(t("missing.key" as never)).toBe("missing.key");
  });

  it("walks parent locales and skips catalogs it has no entry for", () => {
    // `en-US-POSIX` narrows to `en-US` then `en`; only the `en-us` catalog exists
    const t = setup("en-US-POSIX", ["fr-FR", "id-id"]);
    expect(t("welcome" as never)).toBe("Welcome");
  });

  it("accepts an array of fallback locales", () => {
    const t = setup("fr-FR", ["de-DE", "id-id"]);
    expect(t("welcome" as never)).toBe("Selamat datang");
  });

  it("resolves nested dot paths", () => {
    expect(setup()("nested.deep.label" as never)).toBe("Deep label");
  });

  it("returns the key for paths that stop on a string or on an object", () => {
    const t = setup();
    // `welcome` is a string, so `welcome.extra` cannot resolve
    expect(t("welcome.extra" as never)).toBe("welcome.extra");
    // `nested.deep` is an object, so it is not a renderable translation
    expect(t("nested.deep" as never)).toBe("nested.deep");
  });

  it("throws on keys with empty segments", () => {
    expect(() => setup()("nested..label" as never)).toThrow(
      "[getTranslationByKey]: Invalid key!"
    );
  });
});

describe("initI18n substitutions", () => {
  it("selects plural rules by type", () => {
    const t = setup();
    expect(t("ordinal" as never, { place: 1 } as never)).toBe("1st");
    expect(t("ordinal" as never, { place: 2 } as never)).toBe("2nd");
    expect(t("ordinal" as never, { place: 4 } as never)).toBe("4th");
  });

  it("substitutes enum values", () => {
    expect(setup()("status" as never, { state: "archived" } as never)).toBe(
      "Status: Archived"
    );
  });

  it("substitutes numbers with Intl.NumberFormat options", () => {
    expect(setup()("price" as never, { amount: 1234.5 } as never)).toBe(
      "Total $1,234.50"
    );
  });

  it("substitutes lists with Intl.ListFormat options", () => {
    expect(setup()("tags" as never, { items: ["a", "b", "c"] } as never)).toBe(
      "Tags: a, b, and c"
    );
  });

  it("substitutes dates with Intl.DateTimeFormat options", () => {
    expect(
      setup()(
        "lastLogin" as never,
        {
          at: new Date("2024-03-05T00:00:00.000Z"),
        } as never
      )
    ).toBe("Last login 3/5/24");
  });

  it("throws TypeError when an argument does not match its param type", () => {
    const t = setup();
    expect(() => t("inbox" as never, { count: "1" } as never)).toThrow(
      TypeError
    );
    expect(() => t("status" as never, { state: 1 } as never)).toThrow(
      TypeError
    );
    expect(() => t("price" as never, { amount: "1" } as never)).toThrow(
      TypeError
    );
    expect(() => t("tags" as never, { items: "a" } as never)).toThrow(
      TypeError
    );
    expect(() =>
      t("lastLogin" as never, { at: "2024-03-05" } as never)
    ).toThrow(TypeError);
  });

  it("throws when a plural or enum replacement is missing", () => {
    const t = setup();
    expect(() => t("unknownPlural" as never, { count: 5 } as never)).toThrow(
      "Missing replacement value"
    );
    expect(() => t("status" as never, { state: "deleted" } as never)).toThrow(
      "Missing replacement value"
    );
  });

  it("leaves the raw key in place when the arg has no placeholder", () => {
    // `{missing}` never appears in "Welcome", so `replace` finds nothing
    expect(setup()("welcome" as never, { missing: "x" } as never)).toBe(
      "Welcome"
    );
  });
});
