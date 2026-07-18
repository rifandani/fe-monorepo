import { authKeys, authRepositories } from "@workspace/core/apis/better-auth";
import { describe, expect, it, vi } from "vitest";

const user = {
  createdAt: "2024-01-01",
  email: "ada@example.com",
  emailVerified: true,
  id: "u1",
  name: "Ada",
  updatedAt: "2024-01-01",
};

const session = {
  createdAt: "2024-01-01",
  expiresAt: "2024-01-02",
  id: "s1",
  ipAddress: "127.0.0.1",
  token: "t1",
  updatedAt: "2024-01-01",
  userAgent: "vitest",
  userId: "u1",
};

const mockResponse = (body: unknown) => ({
  headers: new Headers({ "x-test": "1" }),
  json: vi.fn(() => body),
});

describe("better-auth authKeys", () => {
  it("builds query keys", () => {
    expect(authKeys.all()).toEqual(["auth"]);
    expect(authKeys.signOut()).toEqual(["auth", "signOut"]);
    expect(authKeys.signInEmail()).toEqual(["auth", "signInEmail"]);
    expect(
      authKeys.signUpEmail({
        email: "a@b.c",
        name: "Ada",
        password: "password1",
      })
    ).toEqual([
      "auth",
      "signUpEmail",
      { email: "a@b.c", name: "Ada", password: "password1" },
    ]);
  });
});

describe("better-auth authRepositories", () => {
  it("getSession / signInEmail / signOut / signUpEmail parse responses", async () => {
    const get = vi.fn(() => mockResponse({ session, user }));
    const post = vi.fn((path: string) => {
      if (path.includes("sign-out")) {
        return mockResponse({ success: true });
      }
      if (path.includes("sign-up")) {
        return mockResponse({ token: "tok", user });
      }
      return mockResponse({
        redirect: false,
        token: "tok",
        url: null,
        user,
      });
    });
    const http = { instance: { get, post } } as never;
    const repos = authRepositories(http);

    const sessionResult = await repos.getSession();
    expect(sessionResult.json?.user.email).toBe("ada@example.com");
    expect(sessionResult.headers.get("x-test")).toBe("1");

    const signIn = await repos.signInEmail({
      json: { email: "ada@example.com", password: "password1" },
    });
    expect(signIn.json.token).toBe("tok");

    const signOut = await repos.signOut();
    expect(signOut.json.success).toBe(true);

    const signUp = await repos.signUpEmail({
      json: {
        email: "ada@example.com",
        name: "Ada",
        password: "password1",
      },
    });
    expect(signUp.json.user.name).toBe("Ada");
  });
});
