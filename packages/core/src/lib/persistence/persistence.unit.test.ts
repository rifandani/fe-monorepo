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

// Helpers

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

/** A `Storage` the test can seed and read back, raw strings included. */
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

/** Persistence on a storage seeded with `seed`; `id-id` is the default Locale. */
const setup = (seed: Record<string, string> = {}) => {
  const entries = new Map(Object.entries(seed));

  const persistence = makePersistence(
    KeyValueStore.layerStorage(() => makeStorage(entries)),
    { defaultLocale: () => "id-id" }
  );

  return { entries, persistence };
};

/** A second Persistence on the same entries: what the app sees after a reload. */
const reload = (entries: Map<string, string>) =>
  setup(Object.fromEntries(entries)).persistence;

describe("makePersistence", () => {
  it("should read the defaults from an empty storage", () => {
    // Arrange
    const { persistence } = setup();
    const { registry } = persistence;

    // Act
    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
      registry.get(persistence.localeAtom),
    ];

    // Assert
    expect(values).toEqual([null, "system", "id-id"]);
  });

  it("should read stored values on the first read", () => {
    // Arrange
    const { persistence } = setup({
      [persistenceKeys.locale]: JSON.stringify("en-us"),
      [persistenceKeys.session]: JSON.stringify(ada),
      [persistenceKeys.theme]: JSON.stringify("dark"),
    });

    const { registry } = persistence;

    // Act
    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
      registry.get(persistence.localeAtom),
    ];

    // Assert
    expect(values).toEqual([ada, "dark", "en-us"]);
  });

  it("should read a malformed entry as the default", () => {
    // Arrange
    const { persistence } = setup({
      [persistenceKeys.session]: JSON.stringify({ username: "ada" }),
      [persistenceKeys.theme]: JSON.stringify("sepia"),
    });

    const { registry } = persistence;

    // Act
    const values = [
      registry.get(persistence.sessionAtom),
      registry.get(persistence.themeAtom),
    ];

    // Assert
    expect(values).toEqual([null, "system"]);
  });

  it("should read an unsupported Locale as the default", () => {
    // Arrange
    const stored = [
      JSON.stringify("en-gb"),
      JSON.stringify("fr-fr"),
      JSON.stringify(42),
      "not json",
    ];

    for (const value of stored) {
      const { persistence } = setup({ [persistenceKeys.locale]: value });

      // Act
      const locale = persistence.registry.get(persistence.localeAtom);

      // Assert
      expect(locale).toBe("id-id");
    }
  });

  it("should write each value under its own key", () => {
    // Arrange
    const { entries, persistence } = setup();
    const { registry } = persistence;

    // Act
    registry.set(persistence.sessionAtom, ada);
    registry.set(persistence.themeAtom, "light");
    registry.set(persistence.localeAtom, "en-us");

    // Assert
    expect(JSON.parse(entries.get(persistenceKeys.session) ?? "")).toEqual(ada);
    expect(JSON.parse(entries.get(persistenceKeys.theme) ?? "")).toBe("light");
    expect(JSON.parse(entries.get(persistenceKeys.locale) ?? "")).toBe("en-us");
  });

  it("should keep the Session key that the Route Tests read", () => {
    // Assert
    expect(persistenceKeys.session).toBe("app-user");
  });

  it("should build an independent registry for each call", () => {
    // Arrange
    const first = setup().persistence;
    const second = setup().persistence;

    // Act
    first.registry.set(first.themeAtom, "dark");

    // Assert
    expect(second.registry.get(second.themeAtom)).toBe("system");
  });

  test.prop([
    sessionArb,
    fc.constantFrom(...themes),
    fc.constantFrom(...locales),
  ])(
    "should read back after a reload every value it wrote",
    (session, theme, locale) => {
      // Arrange
      const { entries, persistence } = setup();
      persistence.registry.set(persistence.sessionAtom, session);
      persistence.registry.set(persistence.themeAtom, theme);
      persistence.registry.set(persistence.localeAtom, locale);

      // Act
      const reloaded = reload(entries);

      // Assert
      expect(reloaded.registry.get(reloaded.sessionAtom)).toEqual(session);
      expect(reloaded.registry.get(reloaded.themeAtom)).toBe(theme);
      expect(reloaded.registry.get(reloaded.localeAtom)).toBe(locale);
    }
  );

  test.prop([fc.string(), fc.string(), fc.string()])(
    "should never read a value outside its schema, whatever is stored",
    (storedSession, storedTheme, storedLocale) => {
      // Arrange
      const { persistence } = setup({
        [persistenceKeys.session]: storedSession,
        [persistenceKeys.theme]: storedTheme,
        [persistenceKeys.locale]: storedLocale,
      });

      const { registry } = persistence;

      // Act
      const theme = registry.get(persistence.themeAtom);
      const locale = registry.get(persistence.localeAtom);

      // Assert
      expect(themes).toContain(theme);
      expect(locales).toContain(locale);
      expect(registry.get(persistence.sessionAtom)).toBeNull();
    }
  );
});
