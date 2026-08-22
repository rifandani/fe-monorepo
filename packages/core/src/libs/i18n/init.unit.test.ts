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
        // SAFETY: deliberately missing `other`, so `select()` finds nothing to
        // use - the cast is what lets the fixture express that broken catalog.
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

/** Values the fixture catalog's placeholders accept, valid or deliberately not. */
type FixtureParams = Record<string, Date | number | string | readonly string[]>;

/**
 * SAFETY: `initI18n` and the `t` it returns are typed against the application's
 * real catalog through the `my-translations` module augmentation, while this suite
 * drives the fixture catalog above. The `never` casts opt each call out of that
 * global contract; the runtime values are the fixture keys and params declared
 * here, which is exactly what the assertions check.
 */
const setup = (
  locale = "en-us",
  fallbackLocale: string | string[] = "en-us"
) => {
  // SAFETY: see the note above - the fixture catalog only matches at runtime.
  const { t } = initI18n({
    locale,
    fallbackLocale,
    translations: translations as never,
  });
  // SAFETY: likewise, the fixture's keys and params are absent from the
  // registered catalog `t` is typed against.
  return (key: string, params?: FixtureParams) =>
    t(key as never, params as never);
};

describe("initI18n", () => {
  it("translates simple keys for the active locale", () => {
    const t = setup("en-US");
    expect(t("welcome")).toBe("Welcome");
  });

  it("falls back to another locale catalog", () => {
    const t = setup("fr-FR", "id-id");
    expect(t("welcome")).toBe("Selamat datang");
  });

  it("substitutes plain params", () => {
    const t = setup();
    expect(t("greeting", { name: "Ada" })).toBe("Hello Ada!");
  });

  it("handles plural substitution", () => {
    const t = setup();
    expect(t("inbox", { count: 1 })).toBe("You have 1 message");
    expect(t("inbox", { count: 3 })).toBe("You have 3 messages");
  });

  it("returns the key when missing everywhere", () => {
    const t = setup();
    expect(t("missing.key")).toBe("missing.key");
  });

  it("walks parent locales and skips catalogs it has no entry for", () => {
    // `en-US-POSIX` narrows to `en-US` then `en`; only the `en-us` catalog exists
    const t = setup("en-US-POSIX", ["fr-FR", "id-id"]);
    expect(t("welcome")).toBe("Welcome");
  });

  it("accepts an array of fallback locales", () => {
    const t = setup("fr-FR", ["de-DE", "id-id"]);
    expect(t("welcome")).toBe("Selamat datang");
  });

  it("resolves nested dot paths", () => {
    expect(setup()("nested.deep.label")).toBe("Deep label");
  });

  it("returns the key for paths that stop on a string or on an object", () => {
    const t = setup();
    // `welcome` is a string, so `welcome.extra` cannot resolve
    expect(t("welcome.extra")).toBe("welcome.extra");
    // `nested.deep` is an object, so it is not a renderable translation
    expect(t("nested.deep")).toBe("nested.deep");
  });

  it("throws on keys with empty segments", () => {
    expect(() => setup()("nested..label")).toThrow(
      "[getTranslationByKey]: Invalid key!"
    );
  });
});

describe("initI18n substitutions", () => {
  it("selects plural rules by type", () => {
    const t = setup();
    expect(t("ordinal", { place: 1 })).toBe("1st");
    expect(t("ordinal", { place: 2 })).toBe("2nd");
    expect(t("ordinal", { place: 4 })).toBe("4th");
  });

  it("substitutes enum values", () => {
    expect(setup()("status", { state: "archived" })).toBe("Status: Archived");
  });

  it("substitutes numbers with Intl.NumberFormat options", () => {
    expect(setup()("price", { amount: 1234.5 })).toBe("Total $1,234.50");
  });

  it("substitutes lists with Intl.ListFormat options", () => {
    expect(setup()("tags", { items: ["a", "b", "c"] })).toBe(
      "Tags: a, b, and c"
    );
  });

  it("substitutes dates with Intl.DateTimeFormat options", () => {
    expect(
      setup()("lastLogin", {
        at: new Date("2024-03-05T00:00:00.000Z"),
      })
    ).toBe("Last login 3/5/24");
  });

  it("throws TypeError when an argument does not match its param type", () => {
    const t = setup();
    expect(() => t("inbox", { count: "1" })).toThrow(TypeError);
    expect(() => t("status", { state: 1 })).toThrow(TypeError);
    expect(() => t("price", { amount: "1" })).toThrow(TypeError);
    expect(() => t("tags", { items: "a" })).toThrow(TypeError);
    expect(() => t("lastLogin", { at: "2024-03-05" })).toThrow(TypeError);
  });

  it("throws when a plural or enum replacement is missing", () => {
    const t = setup();
    expect(() => t("unknownPlural", { count: 5 })).toThrow(
      "Missing replacement value"
    );
    expect(() => t("status", { state: "deleted" })).toThrow(
      "Missing replacement value"
    );
  });

  it("leaves the raw key in place when the arg has no placeholder", () => {
    // `{missing}` never appears in "Welcome", so `replace` finds nothing
    expect(setup()("welcome", { missing: "x" })).toBe("Welcome");
  });
});
