import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/services/http";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const resourceUrl = `${MOCK_API_BASE_URL}/things`;

describe("Http", () => {
  it("creates a ky instance from config", () => {
    const instance = new Http({ prefix: MOCK_API_BASE_URL });
    expect(instance.instance).toBeDefined();
    expect(instance.instance.get).toBeTypeOf("function");
  });

  it("sends the Access Token when one is available", async () => {
    let captured: Request | undefined;
    server.use(
      http.get(resourceUrl, ({ request }) => {
        captured = request;
        return HttpResponse.json({});
      })
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: { getToken: () => "abc123" },
    });
    await instance.instance.get("things").json();

    expect(captured?.headers.get("Authorization")).toBe("Bearer abc123");
  });

  it("sends no Access Token header when there is no Session", async () => {
    let captured: Request | undefined;
    server.use(
      http.get(resourceUrl, ({ request }) => {
        captured = request;
        return HttpResponse.json({});
      })
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: { getToken: () => null },
    });
    await instance.instance.get("things").json();

    expect(captured?.headers.get("Authorization")).toBeNull();
  });

  it("ends the Session when a request carrying an Access Token is rejected", async () => {
    let ended = 0;
    server.use(
      http.get(resourceUrl, () => new HttpResponse(null, { status: 401 }))
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: {
        getToken: () => "abc123",
        onUnauthorized: () => {
          ended += 1;
        },
      },
    });

    await expect(instance.instance.get("things").json()).rejects.toThrow();
    expect(ended).toBe(1);
  });

  it("does not end the Session when a request without an Access Token is rejected", async () => {
    // A failed sign-in is a 401, and there is no Session to end.
    let ended = 0;
    server.use(
      http.get(resourceUrl, () => new HttpResponse(null, { status: 401 }))
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: {
        getToken: () => null,
        onUnauthorized: () => {
          ended += 1;
        },
      },
    });

    await expect(instance.instance.get("things").json()).rejects.toThrow();
    expect(ended).toBe(0);
  });

  it("does not end the Session over a header it did not attach", async () => {
    // The module's contract is "the credential *I* sent was rejected". A header
    // the caller set themselves proves no Session and must not end one.
    let ended = 0;
    server.use(
      http.get(resourceUrl, () => new HttpResponse(null, { status: 401 }))
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: {
        getToken: () => null,
        onUnauthorized: () => {
          ended += 1;
        },
      },
    });

    await expect(
      instance.instance
        .get("things", { headers: { Authorization: "Bearer theirs" } })
        .json()
    ).rejects.toThrow();
    expect(ended).toBe(0);
  });

  it("carries the Access Token in whatever scheme the caller names", async () => {
    let captured: Request | undefined;
    server.use(
      http.get(resourceUrl, ({ request }) => {
        captured = request;
        return HttpResponse.json({});
      })
    );

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      auth: {
        getToken: () => "abc123",
        header: "X-Session",
        format: (token) => `Token ${token}`,
      },
    });
    await instance.instance.get("things").json();

    expect(captured?.headers.get("X-Session")).toBe("Token abc123");
    expect(captured?.headers.get("Authorization")).toBeNull();
  });

  it("keeps hooks the caller supplied", async () => {
    const seen: string[] = [];
    server.use(http.get(resourceUrl, () => HttpResponse.json({})));

    const instance = new Http({
      prefix: MOCK_API_BASE_URL,
      hooks: {
        beforeRequest: [
          () => {
            seen.push("caller");
          },
        ],
      },
      auth: { getToken: () => "abc123" },
    });
    await instance.instance.get("things").json();

    expect(seen).toEqual(["caller"]);
  });
});
