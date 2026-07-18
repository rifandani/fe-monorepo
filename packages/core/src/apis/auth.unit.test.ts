import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import { describe, expect, it, vi } from "vitest";

describe("authKeys", () => {
  it("builds login keys", () => {
    expect(authKeys.all).toEqual(["auth"]);
    expect(authKeys.login()).toEqual(["auth", "login"]);
    expect(authKeys.login({ username: "ada", password: "secret1" })).toEqual([
      "auth",
      "login",
      { username: "ada", password: "secret1" },
    ]);
  });
});

describe("authRepositories", () => {
  it("login posts and parses the response", async () => {
    const json = vi.fn(() => ({
      accessToken: "token",
      email: "ada@example.com",
      firstName: "Ada",
      gender: "female",
      id: 1,
      image: "https://example.com/a.png",
      lastName: "Lovelace",
      refreshToken: "refresh",
      username: "ada",
    }));
    const post = vi.fn(() => ({ json }));
    const http = { instance: { post } } as never;

    const result = await authRepositories(http).login({
      json: { username: "ada", password: "secret1" },
    });

    expect(post).toHaveBeenCalledWith(
      "auth/login",
      expect.objectContaining({
        json: { username: "ada", password: "secret1" },
      })
    );
    expect(result.username).toBe("ada");
    expect(result.accessToken).toBe("token");
  });
});
