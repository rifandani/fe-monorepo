import { MOCK_API_BASE_URL, server } from "@test/msw";
import { authKeys, authRepositories } from "@workspace/core/apis/better-auth";
import { Http } from "@workspace/core/services/http";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const url = (path: string) => `${MOCK_API_BASE_URL}/api/auth/${path}`;

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

const echoHeader = { "x-test": "1" };

const repositories = () =>
  authRepositories(new Http({ prefix: MOCK_API_BASE_URL }));

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
    expect(authKeys.signUpEmail()).toEqual(["auth", "signUpEmail"]);
    expect(
      authKeys.signInEmail({ email: "a@b.c", password: "password1" })
    ).toEqual([
      "auth",
      "signInEmail",
      { email: "a@b.c", password: "password1" },
    ]);
  });
});

describe("better-auth authRepositories", () => {
  it("getSession parses the session and returns response headers", async () => {
    server.use(
      http.get(url("get-session"), () =>
        HttpResponse.json({ session, user }, { headers: echoHeader })
      )
    );

    const result = await repositories().getSession();

    expect(result.json?.user.email).toBe("ada@example.com");
    expect(result.json?.session.id).toBe("s1");
    expect(result.headers.get("x-test")).toBe("1");
  });

  it("getSession accepts a null body, since the schema is nullable", async () => {
    server.use(http.get(url("get-session"), () => HttpResponse.json(null)));

    const result = await repositories().getSession();

    expect(result.json).toBeNull();
  });

  it("signInEmail posts the credentials and parses the response", async () => {
    let captured: unknown;
    server.use(
      http.post(url("sign-in/email"), async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json(
          { redirect: false, token: "tok", url: null, user },
          { headers: echoHeader }
        );
      })
    );

    const json = { email: "ada@example.com", password: "password1" };
    const result = await repositories().signInEmail({ json });

    expect(captured).toEqual(json);
    expect(result.json.token).toBe("tok");
    expect(result.json.redirect).toBe(false);
    expect(result.headers.get("x-test")).toBe("1");
  });

  it("signOut posts and parses success", async () => {
    let capturedRequest: Request | undefined;
    server.use(
      http.post(url("sign-out"), ({ request }) => {
        capturedRequest = request;
        return HttpResponse.json({ success: true });
      })
    );

    const result = await repositories().signOut();

    expect(capturedRequest?.method).toBe("POST");
    expect(result.json.success).toBe(true);
  });

  it("signUpEmail posts the registration and parses the response", async () => {
    let captured: unknown;
    server.use(
      http.post(url("sign-up/email"), async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ token: "tok", user });
      })
    );

    const json = {
      email: "ada@example.com",
      name: "Ada",
      password: "password1",
    };
    const result = await repositories().signUpEmail({ json });

    expect(captured).toEqual(json);
    expect(result.json.user.name).toBe("Ada");
    expect(result.json.token).toBe("tok");
  });

  it("getSession rejects when the response violates the schema", async () => {
    server.use(
      http.get(url("get-session"), () =>
        HttpResponse.json({ session, user: { ...user, email: "nope" } })
      )
    );

    await expect(repositories().getSession()).rejects.toThrow();
  });

  it("signInEmail rejects on a 401", async () => {
    server.use(
      http.post(url("sign-in/email"), () =>
        HttpResponse.json(
          { message: "Invalid email or password" },
          {
            status: 401,
          }
        )
      )
    );

    await expect(
      repositories().signInEmail({
        json: { email: "ada@example.com", password: "password1" },
      })
    ).rejects.toThrow();
  });

  it("signOut rejects on a 500", async () => {
    server.use(
      http.post(url("sign-out"), () => new HttpResponse(null, { status: 500 }))
    );

    await expect(repositories().signOut()).rejects.toThrow();
  });
});
