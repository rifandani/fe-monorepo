import { describe, expect, it } from "@effect/vitest";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { authApi } from "@workspace/core/auth/api";
import { Http } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { Session } from "@workspace/core/session/session";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

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

/** `authApi` reads `Http` from context, so the test owns the base URL. */
const TestHttp = Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
  Layer.provide(Session.layerMemory()),
  Layer.provide(FetchHttpClient.layer)
);

const login = (json: typeof credentials) =>
  authApi.login(json).pipe(Effect.provide(TestHttp));

describe("authApi", () => {
  it.effect("login posts the credentials and decodes the response", () =>
    Effect.gen(function* () {
      let capturedBody: unknown;
      let capturedRequest: Request | undefined;
      server.use(
        http.post(loginUrl, async ({ request }) => {
          capturedRequest = request;
          capturedBody = await request.json();

          return HttpResponse.json(loginResponse);
        })
      );

      const result = yield* login(credentials);

      // Capture-then-assert, so a mismatch reports an `expect` diff rather than the
      // failure a throwing resolver would surface.
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedBody).toEqual(credentials);
      expect(result.username).toBe("ada");
      expect(result.accessToken).toBe("token");
    })
  );

  it.effect(
    "login fails with a SchemaError when the response violates the schema",
    () =>
      Effect.gen(function* () {
        // This method's whole job is decoding with `authLoginResponseSchema`, and a
        // 200 that decodes cleanly proves nothing about it. Drive a well-formed-but-
        // invalid payload through the real client and assert Schema rejects it.
        server.use(
          http.post(loginUrl, () =>
            HttpResponse.json({ ...loginResponse, email: "not-an-email" })
          )
        );

        const error = yield* Effect.flip(login(credentials));

        expect(error._tag).toBe("SchemaError");
      })
  );

  it.effect("login fails on a 401, carrying the Error Envelope", () =>
    Effect.gen(function* () {
      server.use(
        http.post(loginUrl, () =>
          HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
        )
      );

      // Asserting the failure alone would pass whether or not the envelope
      // survived. `toErrorMessage` reads `data`, and only a real client against
      // a real response proves `Http` populates it.
      const error = yield* Effect.flip(login(credentials));

      expect(error).toBeInstanceOf(HttpResponseError);
      expect(error).toMatchObject({
        status: 401,
        data: { message: "Invalid credentials" },
      });
    })
  );

  it.effect("login fails on a 500", () =>
    Effect.gen(function* () {
      server.use(
        http.post(loginUrl, () => new HttpResponse(null, { status: 500 }))
      );

      const error = yield* Effect.flip(login(credentials));

      expect(error).toMatchObject({ _tag: "HttpResponseError", status: 500 });
    })
  );
});
