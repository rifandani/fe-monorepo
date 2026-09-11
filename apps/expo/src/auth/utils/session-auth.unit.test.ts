import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionAuth } from "@/auth/utils/session-auth";
import { useAppStore } from "@/core/hooks/use-app-store";
import { queryClient } from "@/core/providers/query/client";

// The store persists through `react-native-mmkv`, which Node cannot load.
// Faked at the Module Boundary per ADR-0002's rule of thumb — nothing here
// builds an HTTP request.
const mmkv = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    appStorageId: "app-storage" as const,
    appStateStorage: {
      getItem: (name: string) => store.get(name) ?? null,
      removeItem: (name: string) => {
        store.delete(name);
      },
      setItem: (name: string, value: string) => {
        store.set(name, value);
      },
    },
  };
});

vi.mock("@/core/services/mmkv", () => ({
  appStorageId: mmkv.appStorageId,
  appStateStorage: mmkv.appStateStorage,
}));

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
    useAppStore.getState().reset();
    queryClient.clear();
  });

  it("offers the Access Token of the current Session", () => {
    useAppStore.getState().setUser(validUser);

    expect(sessionAuth.getToken()).toBe("access");
  });

  it("offers nothing when there is no Session", () => {
    expect(sessionAuth.getToken()).toBeNull();
  });

  it("ends the Session when the server rejects the Access Token", () => {
    useAppStore.getState().setUser(validUser);

    sessionAuth.onUnauthorized?.();

    expect(useAppStore.getState().user).toBeNull();
  });
});
