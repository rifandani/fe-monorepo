import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { endSession } from "@/auth/utils/end-session";
import { useAppStore } from "@/core/hooks/use-app-store";
import { queryClient } from "@/core/providers/query/client";

// The store persists through `react-native-mmkv`, which Node cannot load.
// Faked at the Module Boundary per ADR-0002's rule of thumb — nothing here
// builds an HTTP request. Mirrors `core/hooks/use-app-store.unit.test.ts`.
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

describe("endSession", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
    queryClient.clear();
  });

  it("discards the Session", () => {
    useAppStore.getState().setUser(validUser);

    endSession();

    expect(useAppStore.getState().user).toBeNull();
  });

  it("discards the previous Session's cached queries", () => {
    useAppStore.getState().setUser(validUser);
    queryClient.setQueryData(["users", "detail"], { id: 1 });

    endSession();

    expect(queryClient.getQueryData(["users", "detail"])).toBeUndefined();
  });

  it("keeps the theme, which is not part of the Session", () => {
    // `user` and `theme` share one persisted blob, so ending a Session must
    // not reach for the store's `reset`.
    useAppStore.getState().setUser(validUser);
    useAppStore.getState().setTheme("dark");

    endSession();

    expect(useAppStore.getState().theme).toBe("dark");
  });
});
