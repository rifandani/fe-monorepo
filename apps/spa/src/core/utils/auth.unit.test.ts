import { beforeEach, describe, expect, it } from "vitest";

import { userStoreName } from "@/auth/hooks/use-auth-user-store";

import { checkAuthUser } from "./auth";

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

describe("checkAuthUser", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when storage is empty", () => {
    expect(checkAuthUser()).toBe(false);
  });

  it("returns false when user is null", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: null }, version: 0 })
    );
    expect(checkAuthUser()).toBe(false);
  });

  it("returns false when payload fails schema", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: { id: "bad" } }, version: 0 })
    );
    expect(checkAuthUser()).toBe(false);
  });

  it("returns true when a valid user is stored", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: validUser }, version: 0 })
    );
    expect(checkAuthUser()).toBe(true);
  });
});
