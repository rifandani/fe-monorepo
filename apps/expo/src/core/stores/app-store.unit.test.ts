import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { Schema } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { appRegistry } from "@/core/services/atom-registry";
import {
  appStore,
  appStoreDefaults,
  appStoreKeys,
  themeAtom,
  userAtom,
} from "@/core/stores/app-store";

const mmkv = vi.hoisted(() => ({
  stores: new Map<string, Map<string, string>>(),
}));

vi.mock("react-native-mmkv", async () => {
  const { createMmkvModuleFake } = await import("@test/mmkv");
  const fake = createMmkvModuleFake();
  mmkv.stores = fake.stores;

  return fake;
});

const sampleUser: AuthLoginResponseSchema = {
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

/**
 * A fresh module graph, with the app storage emptied and then seeded before
 * any atom reads, so the first read sees exactly `seed`.
 */
const loadFresh = async (seed: Record<string, string> = {}) => {
  vi.resetModules();
  const fresh = await import("@/core/stores/app-store");
  const storage = mmkv.stores.get("app-storage");
  storage?.clear();

  for (const [key, value] of Object.entries(seed)) {
    storage?.set(key, value);
  }

  return fresh;
};

/** What MMKV holds under `key` in the app storage, decoded. */
const decodeJson = Schema.decodeSync(Schema.fromJsonString(Schema.Json));

const persisted = (key: string): Schema.Json | undefined => {
  const raw = mmkv.stores.get("app-storage")?.get(key);

  return raw === undefined ? undefined : decodeJson(raw);
};

describe("appStoreDefaults", () => {
  it("defaults theme to system and user to null", () => {
    expect(appStoreDefaults).toEqual({ theme: "system", user: null });
  });
});

describe("appStore", () => {
  beforeEach(() => {
    appStore.reset();
  });

  it("setUser updates the user atom and persists it", () => {
    appStore.setUser(sampleUser);

    expect(appStore.getUser()).toEqual(sampleUser);
    expect(appRegistry.get(userAtom)).toEqual(sampleUser);
    expect(persisted(appStoreKeys.user)).toEqual(sampleUser);
  });

  it("resetUser clears the user only", () => {
    appStore.setUser(sampleUser);
    appStore.setTheme("dark");
    appStore.resetUser();

    expect(appStore.getUser()).toBeNull();
    expect(appStore.getTheme()).toBe("dark");
    expect(persisted(appStoreKeys.theme)).toBe("dark");
  });

  it("setTheme updates the theme atom and persists it", () => {
    appStore.setTheme("light");

    expect(appRegistry.get(themeAtom)).toBe("light");
    expect(persisted(appStoreKeys.theme)).toBe("light");
  });

  it("reset restores defaults", () => {
    appStore.setUser(sampleUser);
    appStore.setTheme("dark");
    appStore.reset();

    expect(appStore.getUser()).toBeNull();
    expect(appStore.getTheme()).toBe("system");
  });
});

describe("app store atoms on first read", () => {
  it("reads the defaults when nothing is persisted", async () => {
    const fresh = await loadFresh();

    expect(fresh.appStore.getTheme()).toBe("system");
    expect(fresh.appStore.getUser()).toBeNull();
  });

  it("rehydrates a persisted theme and user", async () => {
    const fresh = await loadFresh({
      [appStoreKeys.theme]: JSON.stringify("dark"),
      [appStoreKeys.user]: JSON.stringify(sampleUser),
    });

    expect(fresh.appStore.getTheme()).toBe("dark");
    expect(fresh.appStore.getUser()).toEqual(sampleUser);
  });

  it("reads an unknown theme as the default", async () => {
    const fresh = await loadFresh({
      [appStoreKeys.theme]: JSON.stringify("sepia"),
    });

    expect(fresh.appStore.getTheme()).toBe("system");
  });
});
