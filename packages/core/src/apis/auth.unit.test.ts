import { MOCK_API_BASE_URL, server } from "@test/msw";
import { authKeys, authRepositories } from "@workspace/core/apis/auth";
import { Http } from "@workspace/core/services/http";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const loginUrl = `${MOCK_API_BASE_URL}/auth/login`;

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

const credentials = { username: "ada", password: "secret1" };

/** `authRepositories` takes `Http` by parameter, so the test owns the base URL. */
const repositories = () =>
  authRepositories(new Http({ prefix: MOCK_API_BASE_URL }));

describe("authKeys", () => {
  it("builds login keys", () => {
    expect(authKeys.all).toEqual(["auth"]);
    expect(authKeys.login()).toEqual(["auth", "login"]);
    expect(authKeys.login(credentials)).toEqual(["auth", "login", credentials]);
  });
});

describe("authRepositories", () => {
  it("login posts the credentials and parses the response", async () => {
    let capturedBody: unknown;
    let capturedRequest: Request | undefined;
    server.use(
      http.post(loginUrl, async ({ request }) => {
        capturedRequest = request;
        capturedBody = await request.json();
        return HttpResponse.json(loginResponse);
      })
    );

    const result = await repositories().login({ json: credentials });

    // Capture-then-assert, so a mismatch reports an `expect` diff rather than the
    // HTTPError a throwing resolver would surface.
    expect(capturedRequest?.method).toBe("POST");
    expect(capturedBody).toEqual(credentials);
    expect(result.username).toBe("ada");
    expect(result.accessToken).toBe("token");
  });

  it("login forwards ky options", async () => {
    let captured: Request | undefined;
    server.use(
      http.post(loginUrl, ({ request }) => {
        captured = request;
        return HttpResponse.json(loginResponse);
      })
    );

    await repositories().login(
      { json: credentials },
      { headers: { "x-trace": "abc" } }
    );

    expect(captured?.headers.get("x-trace")).toBe("abc");
  });

  it("login rejects when the response violates the schema", async () => {
    // This method's whole job is `authLoginResponseSchema.parse`, and a 200 that
    // parses cleanly proves nothing about it. Drive a well-formed-but-invalid payload
    // through real ky and assert Zod rejects it.
    server.use(
      http.post(loginUrl, () =>
        HttpResponse.json({ ...loginResponse, email: "not-an-email" })
      )
    );

    await expect(repositories().login({ json: credentials })).rejects.toThrow();
  });

  it("login rejects on a 401", async () => {
    server.use(
      http.post(loginUrl, () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
      )
    );

    await expect(repositories().login({ json: credentials })).rejects.toThrow();
  });

  it("login rejects on a 500", async () => {
    server.use(
      http.post(loginUrl, () => new HttpResponse(null, { status: 500 }))
    );

    await expect(repositories().login({ json: credentials })).rejects.toThrow();
  });
});
