import { fc, test } from "@fast-check/vitest";
import { sessionArb } from "@test/arbitraries";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { themes } from "@workspace/core/constants/core";
import { locales } from "@workspace/core/i18n/locale";
import {
  makePersistence,
  persistenceKeys,
} from "@workspace/core/persistence/persistence";
import { KeyValueStore } from "effect/persistence";
import { describe, expect, it } from "vitest";

import storedV1 from "./stored-v1.json" with { type: "json" };

const ada: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

const makeStorage = (entries: Map<string, string>): Storage => ({
  get length() {
    return entries.size;
  },
  clear: () => {
    entries.clear();
  },
  getItem: (key) => entries.get(key) ?? null,
  key: (index) => [...entries.keys()][index] ?? null,
  removeItem: (key) => {
    entries.delete(key);
  },
  setItem: (key, value) => {
    entries.set(key, value);
  },
});

const setup = (seed: Record<string, string> = {}) => {
  const entries = new Map(Object.entries(seed));

  const persistence = makePersistence(
    KeyValueStore.layerStorage(() => makeStorage(entries)),
    { defaultLocale: () => "id-id" }
  );

  return { entries, persistence };
};

const reload = (entries: Map<string, string>) =>
  setup(Object.fromEntries(entries)).persistence;

describe("makePersistence", () => {
  it("should read the defaults from an empty storage", () => {
    const { persistence } = setup();
    const { registry } = persistence;

    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
      registry.get(persistence.localeAtom),
    ];

    expect(values).toEqual([null, "system", "id-id"]);
  });

  it("should read stored values on the first read", () => {
    const { persistence } = setup({
      [persistenceKeys.locale]: JSON.stringify("en-us"),
      [persistenceKeys.session]: JSON.stringify(ada),
      [persistenceKeys.theme]: JSON.stringify("dark"),
    });

    const { registry } = persistence;

    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
      registry.get(persistence.localeAtom),
    ];

    expect(values).toEqual([ada, "dark", "en-us"]);
  });

  it("should read a malformed entry as the default", () => {
    const { persistence } = setup({
      [persistenceKeys.session]: JSON.stringify({ username: "ada" }),
      [persistenceKeys.theme]: JSON.stringify("sepia"),
    });

    const { registry } = persistence;

    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
    ];

    expect(values).toEqual([null, "system"]);
  });

  it("should read an unsupported Locale as the default", () => {
    const stored = [
      JSON.stringify("en-gb"),
      JSON.stringify("fr-fr"),
      JSON.stringify(42),
      "not json",
    ];

    for (const value of stored) {
      const { persistence } = setup({ [persistenceKeys.locale]: value });

      const locale = persistence.registry.get(persistence.localeAtom);

      expect(locale).toBe("id-id");
    }
  });

  it("should write each value under its own key", () => {
    const { entries, persistence } = setup();
    const { registry } = persistence;

    registry.set(persistence.sessionAtom, ada);
    registry.set(persistence.themeAtom, "light");
    registry.set(persistence.localeAtom, "en-us");

    expect(JSON.parse(entries.get(persistenceKeys.session) ?? "")).toEqual(ada);
    expect(JSON.parse(entries.get(persistenceKeys.theme) ?? "")).toBe("light");
    expect(JSON.parse(entries.get(persistenceKeys.locale) ?? "")).toBe("en-us");
  });

  it("should version every persistence key", () => {
    expect(persistenceKeys).toEqual({
      locale: "app-locale.v1",
      session: "app-user.v1",
      theme: "app-theme.v1",
    });
  });

  it("should decode the committed v1 snapshot of every stored shape", () => {
    const { persistence } = setup(
      Object.fromEntries(
        Object.entries(storedV1).map(([key, value]) => [
          key,
          JSON.stringify(value),
        ])
      )
    );

    const { registry } = persistence;

    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
      registry.get(persistence.localeAtom),
    ];

    expect(values).toEqual([
      storedV1["app-user.v1"],
      storedV1["app-theme.v1"],
      storedV1["app-locale.v1"],
    ]);
  });

  it("should build an independent registry for each call", () => {
    const first = setup().persistence;
    const second = setup().persistence;

    first.registry.set(first.themeAtom, "dark");

    expect(second.registry.get(second.themeAtom)).toBe("system");
  });

  test.prop([
    sessionArb,
    fc.constantFrom(...themes),
    fc.constantFrom(...locales),
  ])(
    "should read back after a reload every value it wrote",
    (session, theme, locale) => {
      const { entries, persistence } = setup();
      persistence.registry.set(persistence.sessionAtom, session);
      persistence.registry.set(persistence.themeAtom, theme);
      persistence.registry.set(persistence.localeAtom, locale);

      const reloaded = reload(entries);

      expect(reloaded.registry.get(reloaded.sessionAtom)).toEqual(session);
      expect(reloaded.registry.get(reloaded.themeAtom)).toBe(theme);
      expect(reloaded.registry.get(reloaded.localeAtom)).toBe(locale);
    }
  );

  test.prop([fc.string(), fc.string(), fc.string()])(
    "should never read a value outside its schema, whatever is stored",
    (storedSession, storedTheme, storedLocale) => {
      const { persistence } = setup({
        [persistenceKeys.session]: storedSession,
        [persistenceKeys.theme]: storedTheme,
        [persistenceKeys.locale]: storedLocale,
      });

      const { registry } = persistence;

      const theme = registry.get(persistence.themeAtom);
      const locale = registry.get(persistence.localeAtom);

      expect(themes).toContain(theme);
      expect(locales).toContain(locale);
      expect(registry.get(persistence.sessionAtom)).toBeNull();
    }
  );
});
