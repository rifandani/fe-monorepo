import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import { describe, expect, it, vi } from "vitest";

const loginResponse = {
  accessToken: "token",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/a.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

/** Drive `login` once, then hand back the `afterResponse` hook it registered. */
const captureAfterResponseHook = async () => {
  const post = vi.fn(() => ({ json: vi.fn(() => loginResponse) }));
  const http = { instance: { post } } as never;

  await authRepositories(http).login({
    json: { username: "ada", password: "secret1" },
  });

  const [, options] = post.mock.calls[0] as unknown as [
    string,
    { hooks: { afterResponse: unknown[] } },
  ];
  return options.hooks.afterResponse[0] as (arg: {
    request: Request;
    response: { status: number; json: () => Promise<unknown> };
  }) => Promise<void>;
};

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
    const json = vi.fn(() => loginResponse);
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

  describe("afterResponse hook", () => {
    it("sets the Authorization header from a 200 response", async () => {
      const afterResponse = await captureAfterResponseHook();
      const request = new Request("https://api.test/auth/login");

      await afterResponse({
        request,
        response: {
          status: 200,
          json: () => Promise.resolve({ accessToken: "token" }),
        },
      });

      expect(request.headers.get("Authorization")).toBe("Bearer token");
    });

    it("leaves headers untouched without a token or on non-200", async () => {
      const afterResponse = await captureAfterResponseHook();

      const noToken = new Request("https://api.test/auth/login");
      await afterResponse({
        request: noToken,
        response: { status: 200, json: () => Promise.resolve({}) },
      });
      expect(noToken.headers.get("Authorization")).toBeNull();

      const unauthorized = new Request("https://api.test/auth/login");
      await afterResponse({
        request: unauthorized,
        response: {
          status: 401,
          json: () => Promise.reject(new Error("not called")),
        },
      });
      expect(unauthorized.headers.get("Authorization")).toBeNull();
    });
  });
});
