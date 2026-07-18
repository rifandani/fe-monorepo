import { describe, expect, it } from "vitest";

import { I18N_COOKIE_NAME, I18N_DEFAULT_LOCALE, I18N_LOCALES } from "./i18n";

describe("i18n constants", () => {
  it("defines cookie name and default locale", () => {
    expect(I18N_COOKIE_NAME).toBe("NEXT_LOCALE");
    expect(I18N_DEFAULT_LOCALE).toBe("en");
  });

  it("lists supported locales", () => {
    expect(I18N_LOCALES).toEqual(["en", "id"]);
  });
});
