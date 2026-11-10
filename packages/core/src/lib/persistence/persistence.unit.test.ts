import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import {
  makePersistence,
  persistenceKeys,
} from "@workspace/core/persistence/persistence";
import { KeyValueStore } from "effect/persistence";
import { describe, expect, it } from "vitest";

const session: AuthLoginResponseSchema = {
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
const makeStorage = (seed: Record<string, string> = {}) => {
  const entries = new Map(Object.entries(seed));

  const storage: Storage = {
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
  };

  return { entries, storage };
};

const setup = (seed?: Record<string, string>) => {
  const { entries, storage } = makeStorage(seed);

  const persistence = makePersistence(
    KeyValueStore.layerStorage(() => storage),
    { defaultLocale: () => "id-id" }
  );

  return { entries, persistence };
};

describe("makePersistence", () => {
  it("reads the defaults from an empty storage", () => {
    const { persistence } = setup();
    const { registry } = persistence;

    expect(registry.get(persistence.sessionAtom)).toBeNull();
    expect(registry.get(persistence.themeAtom)).toBe("system");
    expect(registry.get(persistence.localeAtom)).toBe("id-id");
  });

  it("reads stored values on the first read", () => {
    const { persistence } = setup({
      [persistenceKeys.locale]: JSON.stringify("en-us"),
      [persistenceKeys.session]: JSON.stringify(session),
      [persistenceKeys.theme]: JSON.stringify("dark"),
    });

    const { registry } = persistence;

    expect(registry.get(persistence.sessionAtom)).toEqual(session);
    expect(registry.get(persistence.themeAtom)).toBe("dark");
    expect(registry.get(persistence.localeAtom)).toBe("en-us");
  });

  it("reads a malformed entry as the default", () => {
    const { persistence } = setup({
      [persistenceKeys.session]: JSON.stringify({ username: "ada" }),
      [persistenceKeys.theme]: JSON.stringify("sepia"),
    });

    const { registry } = persistence;

    expect(registry.get(persistence.sessionAtom)).toBeNull();
    expect(registry.get(persistence.themeAtom)).toBe("system");
  });

  it("writes each value under its own key", () => {
    const { entries, persistence } = setup();
    const { registry } = persistence;

    registry.set(persistence.sessionAtom, session);
    registry.set(persistence.themeAtom, "light");
    registry.set(persistence.localeAtom, "en-us");

    expect(JSON.parse(entries.get(persistenceKeys.session) ?? "")).toEqual(
      session
    );
    expect(JSON.parse(entries.get(persistenceKeys.theme) ?? "")).toBe("light");
    expect(JSON.parse(entries.get(persistenceKeys.locale) ?? "")).toBe("en-us");
  });

  it("keeps the Session key the e2e suite reads", () => {
    expect(persistenceKeys.session).toBe("app-user");
  });

  it("builds an independent registry per call", () => {
    const first = setup().persistence;
    const second = setup().persistence;

    first.registry.set(first.themeAtom, "dark");

    expect(second.registry.get(second.themeAtom)).toBe("system");
  });
});
