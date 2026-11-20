import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { ioPropertyParameters } from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/http/http";
import { Session } from "@workspace/core/session/session";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

import { userApi } from "@/features/user/api";
import type { GetUserApiResponseSchema } from "@/features/user/schemas";

// Helpers

/**
 * `userApi` reads `Http` from context, so the test owns the base URL and no
 * app singleton — nor the MMKV-backed Persistence behind its Session — is
 * loaded: the Session is the in-memory adapter.
 * The request itself is still faked at the Network Boundary (ADR-0002).
 */
const TestHttp = Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
  Layer.provide(Session.layerMemory()),
  Layer.provide(FetchHttpClient.layer)
);

const getDetail = (params: { id: number }) =>
  userApi.getDetail(params).pipe(Effect.provide(TestHttp));

const detailUrl = `${MOCK_API_BASE_URL}/users/:id`;

const ada: GetUserApiResponseSchema = {
  age: 36,
  birthDate: "1990-01-01",
  bloodGroup: "O+",
  email: "ada@example.com",
  eyeColor: "brown",
  firstName: "Ada",
  gender: "female",
  height: 170,
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  maidenName: "",
  password: "secret",
  phone: "+1234567890",
  username: "ada",
  weight: 60,
};

/** Serves `user` and records the `:id` path param that each request carried. */
const serveUser = (user: GetUserApiResponseSchema) => {
  const ids: (string | readonly string[] | undefined)[] = [];
  server.use(
    http.get(detailUrl, ({ params }) => {
      ids.push(params.id);

      return HttpResponse.json(user);
    })
  );

  return ids;
};

describe("userApi.getDetail", () => {
  it.effect("should fetch and return the decoded user detail", () =>
    Effect.gen(function* () {
      // Arrange
      let capturedMethod: string | undefined;
      server.use(
        http.get(detailUrl, ({ request }) => {
          capturedMethod = request.method;

          return HttpResponse.json(ada);
        })
      );

      // Act
      const result = yield* getDetail({ id: 1 });

      // Assert
      expect(capturedMethod).toBe("GET");
      expect(result).toEqual(ada);
    })
  );

  it.effect(
    "should fail with a SchemaError when the response breaks the schema",
    () =>
      Effect.gen(function* () {
        // Arrange
        server.use(
          http.get(detailUrl, () =>
            HttpResponse.json({ ...ada, email: "not-an-email" })
          )
        );

        // Act
        const error = yield* Effect.flip(getDetail({ id: 1 }));

        // Assert
        expect(error._tag).toBe("SchemaError");
      })
  );

  it.effect("should fail with the Error Envelope on a 404", () =>
    Effect.gen(function* () {
      // Arrange
      server.use(
        http.get(detailUrl, () =>
          HttpResponse.json({ message: "User not found" }, { status: 404 })
        )
      );

      // Act
      const error = yield* Effect.flip(getDetail({ id: 999 }));

      // Assert
      expect(error).toMatchObject({
        _tag: "HttpResponseError",
        status: 404,
        data: { message: "User not found" },
      });
    })
  );

  test.prop([fc.integer({ min: 1 })], ioPropertyParameters())(
    "should always request the user that the id names",
    async (id) => {
      // Arrange
      // The path param is read off the real request, so this covers the
      // `users/${id}` template and the base URL that the `Http` layer was given.
      const ids = serveUser({ ...ada, id });

      // Act
      const result = await Effect.runPromise(getDetail({ id }));

      // Assert
      expect(ids).toEqual([String(id)]);
      expect(result.id).toBe(id);
    }
  );
});
