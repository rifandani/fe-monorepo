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
  },
  "id-id": {
    welcome: "Selamat datang",
  },
} as const;

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
});
