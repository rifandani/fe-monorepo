import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { endSession } from "@/auth/utils/end-session";
import { persistence } from "@/core/layers/persistence";
import { queryClient } from "@/core/providers/query/client";
import { appStore } from "@/core/stores/app-store";

// The store persists through `react-native-mmkv`, which Node cannot load.
// Faked at the Module Boundary per ADR-0002's rule of thumb — nothing here
// builds an HTTP request. Mirrors `core/stores/app-store.unit.test.ts`.
// `expo-localization` ships React Native source that Node cannot parse. Only the
// Device Locale default reads it, and no test here depends on that default.
vi.mock("expo-localization", () => ({ getLocales: () => [] }));

vi.mock("react-native-mmkv", async () => {
  const { createMmkvModuleFake } = await import("@test/mmkv");

  return createMmkvModuleFake();
});

const validUser: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/a.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

describe("endSession", () => {
  beforeEach(() => {
    appStore.resetUser();
    queryClient.clear();
  });

  it("discards the Session", () => {
    appStore.setUser(validUser);

    endSession();

    expect(appStore.getUser()).toBeNull();
  });

  it("discards the previous Session's cached queries", () => {
    appStore.setUser(validUser);
    queryClient.setQueryData(["users", "detail"], { id: 1 });

    endSession();

    expect(queryClient.getQueryData(["users", "detail"])).toBeUndefined();
  });

  it("keeps the theme, which is not part of the Session", () => {
    // Ending a Session must reach for `resetUser`, never the store's `reset`,
    // which would also put the theme back to its default.
    appStore.setUser(validUser);
    persistence.registry.set(persistence.themeAtom, "dark");

    endSession();

    expect(persistence.registry.get(persistence.themeAtom)).toBe("dark");
  });
});
