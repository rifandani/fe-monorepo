import { describe, expect, it } from "@effect/vitest";
import { test } from "@fast-check/vitest";
import { errorStatusArb, ioPropertyParameters } from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { sessionRefreshLayer } from "@workspace/core/auth/session-refresh";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

// Helpers

const refreshUrl = `${MOCK_API_BASE_URL}/auth/refresh`;

const TestSessionRefresh = sessionRefreshLayer({
  baseUrl: MOCK_API_BASE_URL,
}).pipe(Layer.provide(FetchHttpClient.layer));

const refresh = (refreshToken: string) =>
  Effect.gen(function* () {
    const service = yield* SessionRefresh;

    return yield* service.refresh(refreshToken);
  }).pipe(Effect.provide(TestSessionRefresh));

const respondWithStatus = (status: number) => {
  server.use(http.post(refreshUrl, () => new HttpResponse(null, { status })));
};

describe("sessionRefreshLayer", () => {
  it.effect(
    "should post the refresh token without an Access Token and decode the new pair",
    () =>
      Effect.gen(function* () {
        // Arrange
        let body: unknown;
        let authorization: string | null = "unset";
        server.use(
          http.post(refreshUrl, async ({ request }) => {
            body = await request.json();
            authorization = request.headers.get("Authorization");

            return HttpResponse.json({
              accessToken: "new-access",
              refreshToken: "new-refresh",
            });
          })
        );

        // Act
        const pair = yield* refresh("ada-refresh");

        // Assert
        expect(body).toEqual({ refreshToken: "ada-refresh" });
        expect(authorization).toBeNull();
        expect(pair).toEqual({
          accessToken: "new-access",
          refreshToken: "new-refresh",
        });
      })
  );

  it.effect("should report a 403 as a refused refresh token", () =>
    Effect.gen(function* () {
      // Arrange
      respondWithStatus(403);

      // Act
      const error = yield* Effect.flip(refresh("expired"));

      // Assert
      expect(error).toMatchObject({
        _tag: "SessionRefreshError",
        reason: "Rejected",
      });
    })
  );

  it.effect(
    "should report a response that breaks the schema as a failed refresh",
    () =>
      Effect.gen(function* () {
        // Arrange
        server.use(http.post(refreshUrl, () => HttpResponse.json({})));

        // Act
        const error = yield* Effect.flip(refresh("ada-refresh"));

        // Assert
        expect(error).toMatchObject({ reason: "Failed" });
      })
  );

  test.prop([errorStatusArb(401, 403)], ioPropertyParameters())(
    "should never end the Session for an error status other than 401 and 403",
    async (status) => {
      // Arrange
      respondWithStatus(status);

      // Act
      const error = await Effect.runPromise(
        Effect.flip(refresh("ada-refresh"))
      );

      // Assert
      expect(error).toMatchObject({ reason: "Failed" });
    }
  );
});
