import { fc, test } from "@fast-check/vitest";
import { defineTranslation } from "@workspace/core/i18n/define-translation";
import { initI18n } from "@workspace/core/i18n/init";
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
        // SAFETY: the fixture gives an unknown plural form on purpose, to test the fallback.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
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

type FixtureParams = Record<string, Date | number | string | readonly string[]>;

const setup = (
  locale = "en-us",
  fallbackLocale: string | string[] = "en-us"
) => {
  const { t } = initI18n({
    locale,
    fallbackLocale,
    translations,
  });

  return (key: string, params?: FixtureParams) =>
    // SAFETY: the properties generate keys and params that the fixture does not declare, on purpose.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    t(key as never, params as never);
};

const missingKeyArb = fc
  .array(
    fc.string({ minLength: 1 }).map((text) => text.replaceAll(".", "_")),
    {
      minLength: 1,
    }
  )
  .map((segments) => `missing.${segments.join(".")}`);

describe("initI18n", () => {
  it("should translate a simple key for the active locale", () => {
    const t = setup("en-US");

    const text = t("welcome");

    expect(text).toBe("Welcome");
  });

  it("should fall back to another locale catalog", () => {
    const t = setup("fr-FR", "id-id");

    const text = t("welcome");

    expect(text).toBe("Selamat datang");
  });

  it("should accept an array of fallback locales", () => {
    const t = setup("fr-FR", ["de-DE", "id-id"]);

    const text = t("welcome");

    expect(text).toBe("Selamat datang");
  });

  it("should walk parent locales and skip catalogs it does not have", () => {
    const t = setup("en-US-POSIX", ["fr-FR", "id-id"]);

    const text = t("welcome");

    expect(text).toBe("Welcome");
  });

  it("should resolve a nested dot path", () => {
    const t = setup();

    const text = t("nested.deep.label");

    expect(text).toBe("Deep label");
  });

  it("should return the key when it is missing everywhere", () => {
    const t = setup();

    const text = t("missing.key");

    expect(text).toBe("missing.key");
  });

  it("should return the key for a path that stops on a string or on a group", () => {
    const t = setup();

    const pastMessage = t("welcome.extra");
    const group = t("nested.deep");

    expect(pastMessage).toBe("welcome.extra");
    expect(group).toBe("nested.deep");
  });

  it("should throw on a key with an empty segment", () => {
    const t = setup();

    const act = () => t("nested..label");

    expect(act).toThrow("[getTranslationByKey]: Invalid key!");
  });

  test.prop([missingKeyArb])(
    "should always return a missing key unchanged",
    (key) => {
      const t = setup();

      const text = t(key);

      expect(text).toBe(key);
    }
  );
});

describe("initI18n substitutions", () => {
  it("should substitute a plain param", () => {
    const t = setup();

    const text = t("greeting", { name: "Ada" });

    expect(text).toBe("Hello Ada!");
  });

  it("should pick the plural form for the count", () => {
    const t = setup();

    const one = t("inbox", { count: 1 });
    const many = t("inbox", { count: 3 });

    expect(one).toBe("You have 1 message");
    expect(many).toBe("You have 3 messages");
  });

  it("should pick the plural rules by type", () => {
    const t = setup();

    const places = [1, 2, 4].map((place) => t("ordinal", { place }));

    expect(places).toEqual(["1st", "2nd", "4th"]);
  });

  it("should substitute an enum value", () => {
    const t = setup();

    const text = t("status", { state: "archived" });

    expect(text).toBe("Status: Archived");
  });

  it("should format a number with its Intl.NumberFormat options", () => {
    const t = setup();

    const text = t("price", { amount: 1234.5 });

    expect(text).toBe("Total $1,234.50");
  });

  it("should format a list with its Intl.ListFormat options", () => {
    const t = setup();

    const text = t("tags", { items: ["a", "b", "c"] });

    expect(text).toBe("Tags: a, b, and c");
  });

  it("should format a date with its Intl.DateTimeFormat options", () => {
    const t = setup();

    const text = t("lastLogin", { at: new Date("2024-03-05T00:00:00.000Z") });

    expect(text).toBe("Last login 3/5/24");
  });

  it("should throw a TypeError when an argument does not match its param type", () => {
    const t = setup();

    const mismatches = [
      ["inbox", { count: "1" }],
      ["status", { state: 1 }],
      ["price", { amount: "1" }],
      ["tags", { items: "a" }],
      ["lastLogin", { at: "2024-03-05" }],
    ] as const;

    for (const [key, params] of mismatches) {
      const act = () => t(key, params);

      expect(act).toThrow(TypeError);
    }
  });

  it("should throw when a plural or enum replacement is missing", () => {
    const t = setup();

    const missingPlural = () => t("unknownPlural", { count: 5 });
    const missingEnum = () => t("status", { state: "deleted" });

    expect(missingPlural).toThrow("Missing replacement value");
    expect(missingEnum).toThrow("Missing replacement value");
  });

  it("should leave the message unchanged when an arg has no placeholder", () => {
    const t = setup();

    const text = t("welcome", { missing: "x" });

    expect(text).toBe("Welcome");
  });

  it("should place a param that holds '$&' literally", () => {
    const t = setup();

    const text = t("greeting", { name: "$&" });

    expect(text).toBe("Hello $&!");
  });

  it("should place a list item that holds '$$' literally", () => {
    const t = setup();

    const text = t("tags", { items: ["US$$"] });

    expect(text).toBe("Tags: US$$");
  });

  test.prop([fc.string()])(
    "should always place a plain param literally",
    (name) => {
      const t = setup();

      const text = t("greeting", { name });

      expect(text).toBe(`Hello ${name}!`);
    }
  );

  test.prop([fc.nat()])(
    "should always pick a plural form that holds the formatted count",
    (count) => {
      const t = setup();

      const text = t("inbox", { count });

      expect(text).toBe(
        `You have ${new Intl.NumberFormat("en-us").format(count)} ${count === 1 ? "message" : "messages"}`
      );
    }
  );

  test.prop([fc.array(fc.string())])(
    "should always keep every list item",
    (items) => {
      const t = setup();

      const text = t("tags", { items });

      for (const item of items) {
        expect(text).toContain(item);
      }
    }
  );
});
