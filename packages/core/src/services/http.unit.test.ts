import { describe, expect, it } from "@effect/vitest";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/services/http";
import type { HttpAuthConfig } from "@workspace/core/services/http";
import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { delay, http, HttpResponse } from "msw";

const resourceUrl = `${MOCK_API_BASE_URL}/things`;

/** A fresh `Http` per test, so each one owns its Session wiring. */
const withHttp = (auth?: HttpAuthConfig) =>
  Effect.provide(
    Http.layer({ baseUrl: MOCK_API_BASE_URL, auth }).pipe(
      Layer.provide(FetchHttpClient.layer)
    )
  );

/** Resolve `things` through the `Http` client under test. */
const getThings = (options?: { headers?: Record<string, string> }) =>
  Effect.gen(function* () {
    const client = yield* Http;

    return yield* client.get("things", options);
  });

/** Every request the handler saw, in order; the tests read the first. */
const captureRequests = () => {
  const requests: Request[] = [];
  server.use(
    http.get(resourceUrl, ({ request }) => {
      requests.push(request);

      return HttpResponse.json({});
    })
  );

  return requests;
};

const rejectWith401 = () => {
  server.use(
    http.get(resourceUrl, () => new HttpResponse(null, { status: 401 }))
  );
};

describe("Http", () => {
  it.effect("resolves relative paths against the base URL", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      const response = yield* getThings().pipe(withHttp());

      expect(response.status).toBe(200);
      expect(requests[0]?.url).toBe(resourceUrl);
      expect(requests[0]?.headers.get("accept")).toBe("application/json");
    })
  );

  it.effect("sends the Access Token when one is available", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      yield* getThings().pipe(withHttp({ getToken: () => "abc123" }));

      expect(requests[0]?.headers.get("Authorization")).toBe("Bearer abc123");
    })
  );

  it.effect("sends no Access Token header when there is no Session", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      yield* getThings().pipe(withHttp({ getToken: () => null }));

      expect(requests[0]?.headers.get("Authorization")).toBeNull();
    })
  );

  it.effect(
    "ends the Session when a request carrying an Access Token is rejected",
    () =>
      Effect.gen(function* () {
        let ended = 0;
        rejectWith401();

        const error = yield* Effect.flip(
          getThings().pipe(
            withHttp({
              getToken: () => "abc123",
              onUnauthorized: () => {
                ended += 1;
              },
            })
          )
        );

        expect(error).toMatchObject({ _tag: "HttpResponseError", status: 401 });
        expect(ended).toBe(1);
      })
  );

  it.effect(
    "does not end the Session when a request without an Access Token is rejected",
    () =>
      Effect.gen(function* () {
        // A failed sign-in is a 401, and there is no Session to end.
        let ended = 0;
        rejectWith401();

        yield* Effect.flip(
          getThings().pipe(
            withHttp({
              getToken: () => null,
              onUnauthorized: () => {
                ended += 1;
              },
            })
          )
        );

        expect(ended).toBe(0);
      })
  );

  it.effect("does not end the Session over a header it did not attach", () =>
    Effect.gen(function* () {
      // The module's contract is "the credential *I* sent was rejected". A
      // header the caller set themselves proves no Session and must not end one.
      let ended = 0;
      rejectWith401();

      yield* Effect.flip(
        getThings({ headers: { Authorization: "Bearer theirs" } }).pipe(
          withHttp({
            getToken: () => null,
            onUnauthorized: () => {
              ended += 1;
            },
          })
        )
      );

      expect(ended).toBe(0);
    })
  );

  it.effect(
    "carries the Access Token in whatever scheme the caller names",
    () =>
      Effect.gen(function* () {
        const requests = captureRequests();

        yield* getThings().pipe(
          withHttp({
            getToken: () => "abc123",
            header: "X-Session",
            format: (token) => `Token ${token}`,
          })
        );

        expect(requests[0]?.headers.get("X-Session")).toBe("Token abc123");
        expect(requests[0]?.headers.get("Authorization")).toBeNull();
      })
  );

  it.effect("reads a JSON error body into `data`", () =>
    Effect.gen(function* () {
      server.use(
        http.get(resourceUrl, () =>
          HttpResponse.json({ message: "Nope" }, { status: 403 })
        )
      );

      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      expect(error).toMatchObject({
        _tag: "HttpResponseError",
        status: 403,
        method: "GET",
        url: resourceUrl,
        data: { message: "Nope" },
      });
    })
  );

  it.effect("reads a plain-text error body into `data`", () =>
    Effect.gen(function* () {
      server.use(
        http.get(resourceUrl, () =>
          HttpResponse.text("Service unavailable", { status: 503 })
        )
      );

      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      expect(error).toMatchObject({ data: "Service unavailable" });
    })
  );

  it.effect("reports an empty error body as absent", () =>
    Effect.gen(function* () {
      rejectWith401();

      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      expect(error).toMatchObject({ _tag: "HttpResponseError" });
      expect("data" in error ? error.data : "missing").toBeUndefined();
    })
  );

  // `it.live`: the timeout runs on the real clock, which `it.effect`'s TestClock would freeze.
  it.live("fails a request that exceeds the timeout", () =>
    Effect.gen(function* () {
      server.use(
        http.get(resourceUrl, async () => {
          await delay(200);

          return HttpResponse.json({});
        })
      );

      const error = yield* Effect.flip(
        getThings().pipe(
          Effect.provide(
            Http.layer({
              baseUrl: MOCK_API_BASE_URL,
              timeout: "10 millis",
            }).pipe(Layer.provide(FetchHttpClient.layer))
          )
        )
      );

      expect(error._tag).toBe("TimeoutError");
    })
  );

  it.effect("keeps transport behaviour from the provided HttpClient", () =>
    Effect.gen(function* () {
      // `Http` is built from whatever `HttpClient` the Layer supplies; a wrapper
      // added there (here: a request-tagging one) must still apply.
      const requests = captureRequests();

      const TaggedTransport = Layer.effect(
        HttpClient.HttpClient,
        Effect.gen(function* () {
          return HttpClient.mapRequest(
            yield* HttpClient.HttpClient,
            HttpClientRequest.setHeader("x-transport", "tagged")
          );
        })
      );

      yield* getThings().pipe(
        Effect.provide(
          Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
            Layer.provide(TaggedTransport),
            Layer.provide(FetchHttpClient.layer)
          )
        )
      );

      expect(requests[0]?.headers.get("x-transport")).toBe("tagged");
    })
  );
});
