import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { persistenceKeys } from "@workspace/core/persistence/persistence";
import { Schema } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { persistence } from "@/core/layers/persistence";
import { appStore, userAtom } from "@/core/stores/app-store";

const mmkv = vi.hoisted(() => ({
  stores: new Map<string, Map<string, string>>(),
}));

// `expo-localization` ships React Native source that Node cannot parse. Only the
// Device Locale default reads it, and no test here depends on that default.
vi.mock("expo-localization", () => ({ getLocales: () => [] }));

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

/** What MMKV holds under `key` in the app storage, decoded. */
const decodeJson = Schema.decodeSync(Schema.fromJsonString(Schema.Json));

const persisted = (key: string): Schema.Json | undefined => {
  const raw = mmkv.stores.get("app-storage")?.get(key);

  return raw === undefined ? undefined : decodeJson(raw);
};

describe("appStore", () => {
  beforeEach(() => {
    appStore.resetUser();
    persistence.registry.set(persistence.themeAtom, "system");
  });

  it("setUser updates the user atom and persists it to MMKV", () => {
    appStore.setUser(sampleUser);

    expect(appStore.getUser()).toEqual(sampleUser);
    expect(persistence.registry.get(userAtom)).toEqual(sampleUser);
    expect(persisted(persistenceKeys.session)).toEqual(sampleUser);
  });

  it("resetUser clears the user only", () => {
    appStore.setUser(sampleUser);
    persistence.registry.set(persistence.themeAtom, "dark");
    appStore.resetUser();

    expect(appStore.getUser()).toBeNull();
    expect(persisted(persistenceKeys.theme)).toBe("dark");
  });
});
