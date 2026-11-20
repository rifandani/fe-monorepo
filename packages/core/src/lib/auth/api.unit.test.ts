import { describe, expect, it } from "@effect/vitest";
import { test } from "@fast-check/vitest";
import { sessionArb, ioPropertyParameters } from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { authApi } from "@workspace/core/auth/api";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import { Http } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { Session } from "@workspace/core/session/session";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

// Helpers

const loginUrl = `${MOCK_API_BASE_URL}/auth/login`;

const adaSession: AuthLoginResponseSchema = {
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

const adaCredentials: AuthLoginRequestSchema = {
  username: "ada",
  password: "secret1",
};

/** `authApi` reads `Http` from context, so the test owns the base URL. */
const TestHttp = Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
  Layer.provide(Session.layerMemory()),
  Layer.provide(FetchHttpClient.layer)
);

const login = (json: AuthLoginRequestSchema) =>
  authApi.login(json).pipe(Effect.provide(TestHttp));

const respondWith = (response: () => Response) => {
  server.use(http.post(loginUrl, response));
};

describe("authApi.login", () => {
  it.effect("should post the credentials and decode the response", () =>
    Effect.gen(function* () {
      // Arrange
      let capturedBody: unknown;
      let capturedMethod: string | undefined;
      server.use(
        http.post(loginUrl, async ({ request }) => {
          capturedMethod = request.method;
          capturedBody = await request.json();

          return HttpResponse.json(adaSession);
        })
      );

      // Act
      const result = yield* login(adaCredentials);

      // Assert
      // Capture-then-assert, so a mismatch reports an `expect` diff rather than the
      // failure a throwing resolver would surface.
      expect(capturedMethod).toBe("POST");
      expect(capturedBody).toEqual(adaCredentials);
      expect(result).toEqual(adaSession);
    })
  );

  it.effect(
    "should fail with a SchemaError when the response breaks the schema",
    () =>
      Effect.gen(function* () {
        // Arrange
        // This method's whole job is decoding with `authLoginResponseSchema`, and a
        // 200 that decodes cleanly proves nothing about it. Drive a well-formed-but-
        // invalid payload through the real client and assert Schema rejects it.
        respondWith(() =>
          HttpResponse.json({ ...adaSession, email: "not-an-email" })
        );

        // Act
        const error = yield* Effect.flip(login(adaCredentials));

        // Assert
        expect(error._tag).toBe("SchemaError");
      })
  );

  it.effect("should fail on a 401 and carry the Error Envelope", () =>
    Effect.gen(function* () {
      // Arrange
      respondWith(() =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
      );

      // Act
      const error = yield* Effect.flip(login(adaCredentials));

      // Assert
      // Asserting the failure alone would pass whether or not the envelope
      // survived. `toErrorMessage` reads `data`, and only a real client against
      // a real response proves `Http` populates it.
      expect(error).toBeInstanceOf(HttpResponseError);
      expect(error).toMatchObject({
        status: 401,
        data: { message: "Invalid credentials" },
      });
    })
  );

  it.effect("should fail on a 500", () =>
    Effect.gen(function* () {
      // Arrange
      respondWith(() => new HttpResponse(null, { status: 500 }));

      // Act
      const error = yield* Effect.flip(login(adaCredentials));

      // Assert
      expect(error).toMatchObject({ _tag: "HttpResponseError", status: 500 });
    })
  );

  test.prop([sessionArb], ioPropertyParameters())(
    "should decode any Session the schema accepts unchanged",
    async (session) => {
      // Arrange
      respondWith(() => HttpResponse.json(session));

      // Act
      const result = await Effect.runPromise(login(adaCredentials));

      // Assert
      expect(result).toEqual(session);
    }
  );
});
