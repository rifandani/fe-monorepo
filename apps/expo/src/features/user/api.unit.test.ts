import { describe, expect, it } from "@effect/vitest";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/http/http";
import { Session } from "@workspace/core/session/session";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

import { userApi } from "@/features/user/api";
import type { GetUserApiResponseSchema } from "@/features/user/schemas";

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

const sampleUser: GetUserApiResponseSchema = {
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

describe("userApi.getDetail", () => {
  it.effect("fetches and returns the decoded user detail", () =>
    Effect.gen(function* () {
      let capturedId: string | readonly string[] | undefined;
      let capturedRequest: Request | undefined;
      server.use(
        http.get(detailUrl, ({ params, request }) => {
          capturedId = params.id;
          capturedRequest = request;

          return HttpResponse.json(sampleUser);
        })
      );

      const result = yield* getDetail({ id: 1 });

      // The path param is read off the real request rather than a spy's call args, so this
      // covers the `users/${id}` template *and* the base URL the `Http` layer was given — neither of which the previous module-boundary
      // mock could observe.
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedId).toBe("1");
      expect(result).toEqual(sampleUser);
    })
  );

  it.effect(
    "fails with a SchemaError when the response violates the schema",
    () =>
      Effect.gen(function* () {
        server.use(
          http.get(detailUrl, () =>
            HttpResponse.json({ ...sampleUser, email: "not-an-email" })
          )
        );

        const error = yield* Effect.flip(getDetail({ id: 1 }));

        expect(error._tag).toBe("SchemaError");
      })
  );

  it.effect("fails with the Error Envelope on a 404", () =>
    Effect.gen(function* () {
      server.use(
        http.get(detailUrl, () =>
          HttpResponse.json({ message: "User not found" }, { status: 404 })
        )
      );

      const error = yield* Effect.flip(getDetail({ id: 999 }));

      expect(error).toMatchObject({
        _tag: "HttpResponseError",
        status: 404,
        data: { message: "User not found" },
      });
    })
  );
});
