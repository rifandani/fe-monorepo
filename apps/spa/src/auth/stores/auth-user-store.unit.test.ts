import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  authUserAtom,
  authUserStore,
  authUserStoreName,
} from "@/auth/stores/auth-user-store";
import { persistence } from "@/core/layers/persistence";

const validUser = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female" as const,
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

/** A fresh module graph, so the atom reads storage before anything writes. */
const loadFresh = async () => {
  vi.resetModules();

  return await import("@/auth/stores/auth-user-store");
};

describe("authUserStore", () => {
  beforeEach(() => {
    authUserStore.clear();
  });

  it("exports the persistence key", () => {
    expect(authUserStoreName).toBe("app-user");
  });

  it("starts with a null user", () => {
    expect(authUserStore.get()).toBeNull();
  });

  it("set stores the user and persists it under authUserStoreName", () => {
    authUserStore.set(validUser);

    expect(authUserStore.get()).toEqual(validUser);
    expect(persistence.registry.get(authUserAtom)).toEqual(validUser);
    expect(JSON.parse(localStorage.getItem(authUserStoreName) ?? "")).toEqual(
      validUser
    );
  });

  it("clear nulls the user and updates persistence", () => {
    authUserStore.set(validUser);
    authUserStore.clear();

    expect(authUserStore.get()).toBeNull();
    expect(localStorage.getItem(authUserStoreName)).toBe("null");
  });

  it("notifies subscribers on every change", () => {
    const seen: (string | null)[] = [];

    const unsubscribe = persistence.registry.subscribe(authUserAtom, (user) => {
      seen.push(user?.username ?? null);
    });

    authUserStore.set(validUser);
    authUserStore.clear();
    unsubscribe();

    expect(seen).toEqual(["ada", null]);
  });
});

describe("authUserAtom on first read", () => {
  it("is null when nothing is persisted, and persists that default", async () => {
    localStorage.clear();
    const fresh = await loadFresh();

    expect(fresh.authUserStore.get()).toBeNull();
    expect(localStorage.getItem(authUserStoreName)).toBe("null");
  });

  it("rehydrates a persisted user", async () => {
    localStorage.setItem(authUserStoreName, JSON.stringify(validUser));
    const fresh = await loadFresh();

    expect(fresh.authUserStore.get()).toEqual(validUser);
  });

  it("reads a corrupted entry as no Session", async () => {
    localStorage.setItem(
      authUserStoreName,
      JSON.stringify({ ...validUser, email: "not-an-email" })
    );
    const fresh = await loadFresh();

    expect(fresh.authUserStore.get()).toBeNull();
  });
});
