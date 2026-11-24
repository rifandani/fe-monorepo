import { describe, expect, it } from "@effect/vitest";
import { ioPropertyOptions, sessionArbitrary } from "@test/arbitraries";
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
      let capturedBody: unknown;
      let capturedMethod: string | undefined;
      server.use(
        http.post(loginUrl, async ({ request }) => {
          capturedMethod = request.method;
          capturedBody = await request.json();

          return HttpResponse.json(adaSession);
        })
      );

      const result = yield* login(adaCredentials);

      expect(capturedMethod).toBe("POST");
      expect(capturedBody).toEqual(adaCredentials);
      expect(result).toEqual(adaSession);
    })
  );

  it.effect(
    "should fail with a SchemaError when the response breaks the schema",
    () =>
      Effect.gen(function* () {
        respondWith(() =>
          HttpResponse.json({ ...adaSession, email: "not-an-email" })
        );

        const error = yield* Effect.flip(login(adaCredentials));

        expect(error._tag).toBe("SchemaError");
      })
  );

  it.effect("should fail on a 401 and carry the Error Envelope", () =>
    Effect.gen(function* () {
      respondWith(() =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
      );

      const error = yield* Effect.flip(login(adaCredentials));

      expect(error).toBeInstanceOf(HttpResponseError);
      expect(error).toMatchObject({
        status: 401,
        data: { message: "Invalid credentials" },
      });
    })
  );

  it.effect("should fail on a 500", () =>
    Effect.gen(function* () {
      respondWith(() => new HttpResponse(null, { status: 500 }));

      const error = yield* Effect.flip(login(adaCredentials));

      expect(error).toBeInstanceOf(HttpResponseError);
      expect(error).toMatchObject({ status: 500 });
    })
  );

  it.effect.prop(
    "should decode any Session the schema accepts unchanged",
    [sessionArbitrary],
    ([session]) =>
      Effect.gen(function* () {
        respondWith(() => HttpResponse.json(session));

        const result = yield* login(adaCredentials);

        expect(result).toEqual(session);
      }),
    ioPropertyOptions()
  );
});
