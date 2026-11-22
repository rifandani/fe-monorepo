import { initI18n } from "@workspace/core/i18n/init";
import type { I18n } from "@workspace/core/i18n/init";
import { catalogs, defaultLocale } from "@workspace/core/i18n/locale";
import { describe, expect, expectTypeOf, it } from "vitest";

const setupRegistered = () =>
  initI18n({
    fallbackLocale: defaultLocale,
    locale: "en-US",
    translations: catalogs,
  }).t;

describe("initI18n with the registered catalog", () => {
  it("should give the same t type as the exported I18n type", () => {
    const t = setupRegistered();

    expectTypeOf(t).toEqualTypeOf<I18n["t"]>();
  });

  it("should translate a key and its params from the registered catalog", () => {
    const t = setupRegistered();

    const text = t("backTo", { target: "home" });

    expect(text).toBe("Back to home page");
  });

  it("should reject an unknown key at compile time", () => {
    const t = setupRegistered();

    // @ts-expect-error -- the registered catalog does not declare this key
    const text = t("missing.key");

    expect(text).toBe("missing.key");
  });

  it("should reject params that the message does not declare at compile time", () => {
    const t = setupRegistered();

    // @ts-expect-error -- backTo declares the target param, not page
    const text = t("backTo", { page: "home" });

    expect(text).toBe("Back to {target} page");
  });

  it("should reject params on a message without params at compile time", () => {
    const t = setupRegistered();

    // @ts-expect-error -- theme declares no params
    const text = t("theme", { target: "home" });

    expect(text).toBe("Theme");
  });
});
