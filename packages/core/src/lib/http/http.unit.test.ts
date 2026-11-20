import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { ioPropertyParameters } from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Http } from "@workspace/core/http/http";
import type { HttpAuthConfig } from "@workspace/core/http/http";
import { currentAccessToken, Session } from "@workspace/core/session/session";
import { Effect, Layer, Option } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { delay, http, HttpResponse } from "msw";

// Helpers

const resourceUrl = `${MOCK_API_BASE_URL}/things`;

const sessionWith = (accessToken: string): AuthLoginResponseSchema => ({
  accessToken,
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/a.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
});

/**
 * A fresh `Http` per test, on an in-memory Session, so each test owns its
 * Session. `Session` stays in the context, so a test can read it back.
 */
const withHttp = (
  options: {
    accessToken?: string;
    auth?: HttpAuthConfig;
    onEnd?: Effect.Effect<void>;
  } = {}
) =>
  Effect.provide(
    Http.layer({ baseUrl: MOCK_API_BASE_URL, auth: options.auth }).pipe(
      Layer.provideMerge(
        Session.layerMemory(
          options.accessToken === undefined
            ? null
            : sessionWith(options.accessToken),
          { onEnd: options.onEnd }
        )
      ),
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

const respondWithStatus = (status: number) => {
  server.use(http.get(resourceUrl, () => new HttpResponse(null, { status })));
};

/** Counts how many times the Session ended. */
const sessionEndCounter = () => {
  const counter = {
    ended: 0,
    onEnd: Effect.sync(() => {
      counter.ended += 1;
    }),
  };

  return counter;
};

/**
 * An HTTP error status (400–599) not in `excluded`, built by shifting past each
 * excluded value instead of filtering.
 *
 * 407 is always excluded: `fetch` turns a 407 (Proxy Authentication Required)
 * into a network error, so it never reaches the client as a response.
 */
const errorStatusArb = (...excluded: number[]) => {
  const skipped = [407, ...excluded].toSorted((a, b) => a - b);

  return fc.integer({ min: 400, max: 599 - skipped.length }).map((value) => {
    let status = value;

    for (const skip of skipped) {
      if (status >= skip) {
        status += 1;
      }
    }

    return status;
  });
};

/** A token that is a legal header value: visible ASCII, no space. */
const accessTokenArb = fc.stringMatching(/^[!-~]+$/u);

describe("Http", () => {
  it.effect("should resolve a relative path against the base URL", () =>
    Effect.gen(function* () {
      // Arrange
      const requests = captureRequests();

      // Act
      const response = yield* getThings().pipe(withHttp());

      // Assert
      expect(response.status).toBe(200);
      expect(requests[0]?.url).toBe(resourceUrl);
      expect(requests[0]?.headers.get("accept")).toBe("application/json");
    })
  );

  it.effect("should send the Access Token when one is available", () =>
    Effect.gen(function* () {
      // Arrange
      const requests = captureRequests();

      // Act
      yield* getThings().pipe(withHttp({ accessToken: "abc123" }));

      // Assert
      expect(requests[0]?.headers.get("Authorization")).toBe("Bearer abc123");
    })
  );

  it.effect("should send no Access Token header when there is no Session", () =>
    Effect.gen(function* () {
      // Arrange
      const requests = captureRequests();

      // Act
      yield* getThings().pipe(withHttp());

      // Assert
      expect(requests[0]?.headers.get("Authorization")).toBeNull();
    })
  );

  it.effect(
    "should end the Session when a request that carries the Access Token is rejected",
    () =>
      Effect.gen(function* () {
        // Arrange
        const counter = sessionEndCounter();
        respondWithStatus(401);

        // Act
        const [error, token] = yield* Effect.all([
          Effect.flip(getThings()),
          currentAccessToken,
        ]).pipe(withHttp({ accessToken: "abc123", onEnd: counter.onEnd }));

        // Assert
        expect(error).toMatchObject({ _tag: "HttpResponseError", status: 401 });
        expect(Option.isNone(token)).toBe(true);
        expect(counter.ended).toBe(1);
      })
  );

  it.effect(
    "should not end the Session when a request without an Access Token is rejected",
    () =>
      Effect.gen(function* () {
        // Arrange
        // A failed sign-in is a 401, and there is no Session to end.
        const counter = sessionEndCounter();
        respondWithStatus(401);

        // Act
        yield* Effect.flip(
          getThings().pipe(withHttp({ onEnd: counter.onEnd }))
        );

        // Assert
        expect(counter.ended).toBe(0);
      })
  );

  it.effect("should not end the Session over a header it did not attach", () =>
    Effect.gen(function* () {
      // Arrange
      // The module's contract is "the credential *I* sent was rejected". A
      // header the caller set themselves proves no Session and must not end one.
      const counter = sessionEndCounter();
      respondWithStatus(401);

      // Act
      yield* Effect.flip(
        getThings({ headers: { Authorization: "Bearer theirs" } }).pipe(
          withHttp({ onEnd: counter.onEnd })
        )
      );

      // Assert
      expect(counter.ended).toBe(0);
    })
  );

  it.effect(
    "should carry the Access Token in the scheme the caller names",
    () =>
      Effect.gen(function* () {
        // Arrange
        const requests = captureRequests();

        const auth = {
          header: "X-Session",
          format: (token: string) => `Token ${token}`,
        };

        // Act
        yield* getThings().pipe(withHttp({ accessToken: "abc123", auth }));

        // Assert
        expect(requests[0]?.headers.get("X-Session")).toBe("Token abc123");
        expect(requests[0]?.headers.get("Authorization")).toBeNull();
      })
  );

  it.effect("should read a JSON error body into `data`", () =>
    Effect.gen(function* () {
      // Arrange
      server.use(
        http.get(resourceUrl, () =>
          HttpResponse.json({ message: "Nope" }, { status: 403 })
        )
      );

      // Act
      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      // Assert
      expect(error).toMatchObject({
        _tag: "HttpResponseError",
        status: 403,
        method: "GET",
        url: resourceUrl,
        data: { message: "Nope" },
      });
    })
  );

  it.effect("should read a plain-text error body into `data`", () =>
    Effect.gen(function* () {
      // Arrange
      server.use(
        http.get(resourceUrl, () =>
          HttpResponse.text("Service unavailable", { status: 503 })
        )
      );

      // Act
      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      // Assert
      expect(error).toMatchObject({ data: "Service unavailable" });
    })
  );

  it.effect("should report an empty error body as absent", () =>
    Effect.gen(function* () {
      // Arrange
      respondWithStatus(401);

      // Act
      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      // Assert
      expect(error).toMatchObject({ _tag: "HttpResponseError" });
      expect("data" in error ? error.data : "missing").toBeUndefined();
    })
  );

  // `it.live`: the timeout runs on the real clock, which `it.effect`'s TestClock would freeze.
  it.live("should fail a request that exceeds the timeout", () =>
    Effect.gen(function* () {
      // Arrange
      server.use(
        http.get(resourceUrl, async () => {
          await delay(200);

          return HttpResponse.json({});
        })
      );

      const layer = Http.layer({
        baseUrl: MOCK_API_BASE_URL,
        timeout: "10 millis",
      }).pipe(
        Layer.provide(Session.layerMemory()),
        Layer.provide(FetchHttpClient.layer)
      );

      // Act
      const error = yield* Effect.flip(getThings().pipe(Effect.provide(layer)));

      // Assert
      expect(error._tag).toBe("TimeoutError");
    })
  );

  it.effect(
    "should keep the transport behaviour of the provided HttpClient",
    () =>
      Effect.gen(function* () {
        // Arrange
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

        const layer = Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
          Layer.provide(Session.layerMemory()),
          Layer.provide(TaggedTransport),
          Layer.provide(FetchHttpClient.layer)
        );

        // Act
        yield* getThings().pipe(Effect.provide(layer));

        // Assert
        expect(requests[0]?.headers.get("x-transport")).toBe("tagged");
      })
  );

  test.prop([accessTokenArb], ioPropertyParameters())(
    "should always send the Access Token as a Bearer header",
    async (accessToken) => {
      // Arrange
      const requests = captureRequests();

      // Act
      await Effect.runPromise(getThings().pipe(withHttp({ accessToken })));

      // Assert
      expect(requests[0]?.headers.get("Authorization")).toBe(
        `Bearer ${accessToken}`
      );
    }
  );

  test.prop([errorStatusArb()], ioPropertyParameters())(
    "should always fail an error status with an HttpResponseError for that status",
    async (status) => {
      // Arrange
      respondWithStatus(status);

      // Act
      const error = await Effect.runPromise(
        Effect.flip(getThings().pipe(withHttp()))
      );

      // Assert
      expect(error).toMatchObject({ _tag: "HttpResponseError", status });
    }
  );

  test.prop([errorStatusArb(401)], ioPropertyParameters())(
    "should never end the Session for an error status other than 401",
    async (status) => {
      // Arrange
      const counter = sessionEndCounter();
      respondWithStatus(status);

      // Act
      await Effect.runPromise(
        Effect.flip(
          getThings().pipe(
            withHttp({ accessToken: "abc123", onEnd: counter.onEnd })
          )
        )
      );

      // Assert
      expect(counter.ended).toBe(0);
    }
  );
});
