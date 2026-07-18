import { beforeEach, describe, expect, it } from "vitest";

import { userStoreName } from "@/auth/hooks/use-auth-user-store";

import { validateAuthUser } from "./storage";

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

describe("validateAuthUser", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when storage is empty", () => {
    expect(validateAuthUser()).toBe(false);
  });

  it("returns false when user is null", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: null }, version: 0 })
    );
    expect(validateAuthUser()).toBe(false);
  });

  it("returns false when payload fails schema", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: { id: "bad" } }, version: 0 })
    );
    expect(validateAuthUser()).toBe(false);
  });

  it("returns true when a valid user is stored", () => {
    localStorage.setItem(
      userStoreName,
      JSON.stringify({ state: { user: validUser }, version: 0 })
    );
    expect(validateAuthUser()).toBe(true);
  });
});
