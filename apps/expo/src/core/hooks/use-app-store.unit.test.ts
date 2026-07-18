import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appStoreStateDefaultValues, useAppStore } from "./use-app-store";

vi.mock("../services/mmkv", () => {
  const store = new Map<string, string>();
  return {
    appStorageId: "app-storage",
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

describe("appStoreStateDefaultValues", () => {
  it("defaults theme to system and user to null", () => {
    expect(appStoreStateDefaultValues).toEqual({
      theme: "system",
      user: null,
    });
  });
});

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState(appStoreStateDefaultValues);
  });

  afterEach(() => {
    useAppStore.getState().reset();
  });

  it("setUser updates user", () => {
    useAppStore.getState().setUser(sampleUser);
    expect(useAppStore.getState().user).toEqual(sampleUser);
  });

  it("resetUser clears user only", () => {
    useAppStore.getState().setUser(sampleUser);
    useAppStore.getState().setTheme("dark");
    useAppStore.getState().resetUser();
    expect(useAppStore.getState().user).toBeNull();
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("setTheme updates theme", () => {
    useAppStore.getState().setTheme("light");
    expect(useAppStore.getState().theme).toBe("light");
  });

  it("reset restores defaults", () => {
    useAppStore.getState().setUser(sampleUser);
    useAppStore.getState().setTheme("dark");
    useAppStore.getState().reset();
    expect(useAppStore.getState()).toMatchObject(appStoreStateDefaultValues);
  });
});
