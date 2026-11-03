import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionAuth } from "@/auth/utils/session-auth";
import { queryClient } from "@/core/providers/query/client";
import { appStore } from "@/core/stores/app-store";

// The store persists through `react-native-mmkv`, which Node cannot load.
// Faked at the Module Boundary per ADR-0002's rule of thumb — nothing here
// builds an HTTP request.
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

describe("sessionAuth", () => {
  beforeEach(() => {
    appStore.resetUser();
    queryClient.clear();
  });

  it("offers the Access Token of the current Session", () => {
    appStore.setUser(validUser);

    expect(sessionAuth.getToken()).toBe("access");
  });

  it("offers nothing when there is no Session", () => {
    expect(sessionAuth.getToken()).toBeNull();
  });

  it("ends the Session when the server rejects the Access Token", () => {
    appStore.setUser(validUser);

    sessionAuth.onUnauthorized?.();

    expect(appStore.getUser()).toBeNull();
  });
});
