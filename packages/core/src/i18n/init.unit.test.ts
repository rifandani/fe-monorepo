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
        // SAFETY: deliberately missing `other`, so `select()` finds nothing to
        // use - the cast is what lets the fixture express that broken catalog.
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
    translations,
  });

  // SAFETY: likewise, the fixture's keys and params are absent from the
  // registered catalog `t` is typed against.
  return (key: string, params?: FixtureParams) =>
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    t(key as never, params as never);
};

/** A key under `missing.`, which the fixture catalog does not have. */
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
    // Arrange
    const t = setup("en-US");

    // Act
    const text = t("welcome");

    // Assert
    expect(text).toBe("Welcome");
  });

  it("should fall back to another locale catalog", () => {
    // Arrange
    const t = setup("fr-FR", "id-id");

    // Act
    const text = t("welcome");

    // Assert
    expect(text).toBe("Selamat datang");
  });

  it("should accept an array of fallback locales", () => {
    // Arrange
    const t = setup("fr-FR", ["de-DE", "id-id"]);

    // Act
    const text = t("welcome");

    // Assert
    expect(text).toBe("Selamat datang");
  });

  it("should walk parent locales and skip catalogs it does not have", () => {
    // Arrange
    // `en-US-POSIX` narrows to `en-US` then `en`; only the `en-us` catalog exists
    const t = setup("en-US-POSIX", ["fr-FR", "id-id"]);

    // Act
    const text = t("welcome");

    // Assert
    expect(text).toBe("Welcome");
  });

  it("should resolve a nested dot path", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("nested.deep.label");

    // Assert
    expect(text).toBe("Deep label");
  });

  it("should return the key when it is missing everywhere", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("missing.key");

    // Assert
    expect(text).toBe("missing.key");
  });

  it("should return the key for a path that stops on a string or on a group", () => {
    // Arrange
    const t = setup();

    // Act
    // `welcome` is a string, so `welcome.extra` cannot resolve
    const pastMessage = t("welcome.extra");
    // `nested.deep` is a group, so it is not a renderable translation
    const group = t("nested.deep");

    // Assert
    expect(pastMessage).toBe("welcome.extra");
    expect(group).toBe("nested.deep");
  });

  it("should throw on a key with an empty segment", () => {
    // Arrange
    const t = setup();

    // Act
    const act = () => t("nested..label");

    // Assert
    expect(act).toThrow("[getTranslationByKey]: Invalid key!");
  });

  test.prop([missingKeyArb])(
    "should always return a missing key unchanged",
    (key) => {
      // Arrange
      const t = setup();

      // Act
      const text = t(key);

      // Assert
      expect(text).toBe(key);
    }
  );
});

describe("initI18n substitutions", () => {
  it("should substitute a plain param", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("greeting", { name: "Ada" });

    // Assert
    expect(text).toBe("Hello Ada!");
  });

  it("should pick the plural form for the count", () => {
    // Arrange
    const t = setup();

    // Act
    const one = t("inbox", { count: 1 });
    const many = t("inbox", { count: 3 });

    // Assert
    expect(one).toBe("You have 1 message");
    expect(many).toBe("You have 3 messages");
  });

  it("should pick the plural rules by type", () => {
    // Arrange
    const t = setup();

    // Act
    const places = [1, 2, 4].map((place) => t("ordinal", { place }));

    // Assert
    expect(places).toEqual(["1st", "2nd", "4th"]);
  });

  it("should substitute an enum value", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("status", { state: "archived" });

    // Assert
    expect(text).toBe("Status: Archived");
  });

  it("should format a number with its Intl.NumberFormat options", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("price", { amount: 1234.5 });

    // Assert
    expect(text).toBe("Total $1,234.50");
  });

  it("should format a list with its Intl.ListFormat options", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("tags", { items: ["a", "b", "c"] });

    // Assert
    expect(text).toBe("Tags: a, b, and c");
  });

  it("should format a date with its Intl.DateTimeFormat options", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("lastLogin", { at: new Date("2024-03-05T00:00:00.000Z") });

    // Assert
    expect(text).toBe("Last login 3/5/24");
  });

  it("should throw a TypeError when an argument does not match its param type", () => {
    // Arrange
    const t = setup();

    const mismatches = [
      ["inbox", { count: "1" }],
      ["status", { state: 1 }],
      ["price", { amount: "1" }],
      ["tags", { items: "a" }],
      ["lastLogin", { at: "2024-03-05" }],
    ] as const;

    for (const [key, params] of mismatches) {
      // Act
      const act = () => t(key, params);

      // Assert
      expect(act).toThrow(TypeError);
    }
  });

  it("should throw when a plural or enum replacement is missing", () => {
    // Arrange
    const t = setup();

    // Act
    const missingPlural = () => t("unknownPlural", { count: 5 });
    const missingEnum = () => t("status", { state: "deleted" });

    // Assert
    expect(missingPlural).toThrow("Missing replacement value");
    expect(missingEnum).toThrow("Missing replacement value");
  });

  it("should leave the message unchanged when an arg has no placeholder", () => {
    // Arrange
    const t = setup();

    // Act
    // `{missing}` never appears in "Welcome", so `replace` finds nothing
    const text = t("welcome", { missing: "x" });

    // Assert
    expect(text).toBe("Welcome");
  });

  it("should place a param that holds '$&' literally", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("greeting", { name: "$&" });

    // Assert
    expect(text).toBe("Hello $&!");
  });

  it("should place a list item that holds '$$' literally", () => {
    // Arrange
    const t = setup();

    // Act
    const text = t("tags", { items: ["US$$"] });

    // Assert
    expect(text).toBe("Tags: US$$");
  });

  test.prop([fc.string()])(
    "should always place a plain param literally",
    (name) => {
      // Arrange
      const t = setup();

      // Act
      const text = t("greeting", { name });

      // Assert
      expect(text).toBe(`Hello ${name}!`);
    }
  );

  test.prop([fc.nat()])(
    "should always pick a plural form that holds the formatted count",
    (count) => {
      // Arrange
      const t = setup();

      // Act
      const text = t("inbox", { count });

      // Assert
      expect(text).toBe(
        `You have ${new Intl.NumberFormat("en-us").format(count)} ${count === 1 ? "message" : "messages"}`
      );
    }
  );

  test.prop([fc.array(fc.string())])(
    "should always keep every list item",
    (items) => {
      // Arrange
      const t = setup();

      // Act
      const text = t("tags", { items });

      // Assert
      for (const item of items) {
        expect(text).toContain(item);
      }
    }
  );
});
