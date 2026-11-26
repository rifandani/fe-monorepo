import { describe, expect, it } from "@effect/vitest";
import {
  accessTokenArbitrary,
  errorStatusArbitrary,
  ioPropertyOptions,
} from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Http } from "@workspace/core/http/http";
import type { HttpAuthConfig } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { currentAccessToken, Session } from "@workspace/core/session/session";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { Effect, Layer, Metric, Option, Schema } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { delay, http, HttpResponse } from "msw";

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

const withHttp = (
  options: {
    accessToken?: string;
    auth?: HttpAuthConfig;
    onEnd?: Effect.Effect<void>;
    refresh?: SessionRefresh["Service"];
  } = {}
) =>
  Effect.provide(
    Http.layer({ baseUrl: MOCK_API_BASE_URL, auth: options.auth }).pipe(
      Layer.provideMerge(
        Session.layerMemory(
          options.accessToken === undefined
            ? null
            : sessionWith(options.accessToken),
          { onEnd: options.onEnd, refresh: options.refresh }
        )
      ),
      Layer.provide(FetchHttpClient.layer)
    )
  );

const getThings = (options?: { headers?: Record<string, string> }) =>
  Effect.gen(function* () {
    const client = yield* Http;

    return yield* client.get("things", options);
  });

const getPath = (path: string) =>
  Effect.gen(function* () {
    const client = yield* Http;

    return yield* client.get(path);
  });

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

const captureStatus = (status: number) => {
  const requests: Request[] = [];
  server.use(
    http.get(resourceUrl, ({ request }) => {
      requests.push(request);

      return new HttpResponse(null, { status });
    })
  );

  return requests;
};

const respondWithStatus = (status: number) => {
  server.use(http.get(resourceUrl, () => new HttpResponse(null, { status })));
};

const respondAfter = (milliseconds: number) => {
  server.use(
    http.get(resourceUrl, async () => {
      await delay(milliseconds);

      return HttpResponse.json({});
    })
  );
};

const withSlowHttp = Effect.provide(
  Http.layer({ baseUrl: MOCK_API_BASE_URL, timeout: "10 millis" }).pipe(
    Layer.provide(Session.layerMemory()),
    Layer.provide(FetchHttpClient.layer)
  )
);

const respondToAnyThing = () => {
  server.use(http.get(`${resourceUrl}/:id`, () => HttpResponse.json({})));
};

const renewingServer = SessionRefresh.of({
  refresh: () =>
    Effect.succeed({ accessToken: "new", refreshToken: "new-refresh" }),
});

const acceptOnlyNewToken = () => {
  const sent: (string | null)[] = [];
  server.use(
    http.get(resourceUrl, ({ request }) => {
      const header = request.headers.get("Authorization");
      sent.push(header);

      return header === "Bearer new"
        ? HttpResponse.json({})
        : new HttpResponse(null, { status: 401 });
    })
  );

  return sent;
};

const sessionEndCounter = () => {
  const counter = {
    ended: 0,
    onEnd: Effect.sync(() => {
      counter.ended += 1;
    }),
  };

  return counter;
};

const recorded = (id: string, type: "Counter" | "Histogram") =>
  Metric.snapshot.pipe(
    Effect.map((snapshots) =>
      snapshots.flatMap((snapshot) =>
        snapshot.id === id && snapshot.type === type
          ? [{ attributes: snapshot.attributes, count: snapshot.state.count }]
          : []
      )
    )
  );

const recordedRequests = recorded("http.client.requests", "Counter");

const recordedDurations = recorded("http.client.request.duration", "Histogram");

const withMetricRegistry = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.provideService(effect, Metric.MetricRegistry, new Map());

const resourceIdsSchema = Schema.NonEmptyArray(
  Schema.Union([
    Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
    Schema.String.check(Schema.isUUID()),
  ])
);

const recordedUrlTemplates = recordedRequests.pipe(
  Effect.map((records) =>
    records.map((record) => record.attributes?.["url.template"])
  )
);

describe("Http", () => {
  it.effect("should resolve a relative path against the base URL", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      const response = yield* getThings().pipe(withHttp());

      expect(response.status).toBe(200);
      expect(requests[0]?.url).toBe(resourceUrl);
      expect(requests[0]?.headers.get("accept")).toBe("application/json");
    })
  );

  it.effect("should send the Access Token when one is available", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      yield* getThings().pipe(withHttp({ accessToken: "abc123" }));

      expect(requests[0]?.headers.get("Authorization")).toBe("Bearer abc123");
    })
  );

  it.effect("should send no Access Token header when there is no Session", () =>
    Effect.gen(function* () {
      const requests = captureRequests();

      yield* getThings().pipe(withHttp());

      expect(requests[0]?.headers.get("Authorization")).toBeNull();
    })
  );

  it.effect(
    "should end the Session when a request that carries the Access Token is rejected",
    () =>
      Effect.gen(function* () {
        const counter = sessionEndCounter();
        respondWithStatus(401);

        const [error, token] = yield* Effect.all([
          Effect.flip(getThings()),
          currentAccessToken,
        ]).pipe(withHttp({ accessToken: "abc123", onEnd: counter.onEnd }));

        expect(error).toBeInstanceOf(HttpResponseError);
        expect(error).toMatchObject({ status: 401 });
        expect(Option.isNone(token)).toBe(true);
        expect(counter.ended).toBe(1);
      })
  );

  it.effect(
    "should send a rejected request once more with the Access Token of a refresh",
    () =>
      Effect.gen(function* () {
        const sent = acceptOnlyNewToken();

        const response = yield* getThings().pipe(
          withHttp({ accessToken: "old", refresh: renewingServer })
        );

        expect(response.status).toBe(200);
        expect(sent).toEqual(["Bearer old", "Bearer new"]);
      })
  );

  it.effect(
    "should fail with the second 401 and not refresh again when the retry is rejected",
    () =>
      Effect.gen(function* () {
        const requests = captureStatus(401);

        const error = yield* Effect.flip(
          getThings().pipe(
            withHttp({ accessToken: "old", refresh: renewingServer })
          )
        );

        expect(error).toBeInstanceOf(HttpResponseError);
        expect(error).toMatchObject({ status: 401 });
        expect(requests).toHaveLength(2);
      })
  );

  it.effect(
    "should not end the Session when a request without an Access Token is rejected",
    () =>
      Effect.gen(function* () {
        const counter = sessionEndCounter();
        respondWithStatus(401);

        yield* Effect.flip(
          getThings().pipe(withHttp({ onEnd: counter.onEnd }))
        );

        expect(counter.ended).toBe(0);
      })
  );

  it.effect("should not end the Session over a header it did not attach", () =>
    Effect.gen(function* () {
      const counter = sessionEndCounter();
      respondWithStatus(401);

      yield* Effect.flip(
        getThings({ headers: { Authorization: "Bearer theirs" } }).pipe(
          withHttp({ onEnd: counter.onEnd })
        )
      );

      expect(counter.ended).toBe(0);
    })
  );

  it.effect(
    "should carry the Access Token in the scheme the caller names",
    () =>
      Effect.gen(function* () {
        const requests = captureRequests();

        const auth = {
          header: "X-Session",
          format: (token: string) => `Token ${token}`,
        };

        yield* getThings().pipe(withHttp({ accessToken: "abc123", auth }));

        expect(requests[0]?.headers.get("X-Session")).toBe("Token abc123");
        expect(requests[0]?.headers.get("Authorization")).toBeNull();
      })
  );

  it.effect("should read a JSON error body into `data`", () =>
    Effect.gen(function* () {
      server.use(
        http.get(resourceUrl, () =>
          HttpResponse.json({ message: "Nope" }, { status: 403 })
        )
      );

      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      expect(error).toBeInstanceOf(HttpResponseError);
      expect(error).toMatchObject({
        status: 403,
        method: "GET",
        url: resourceUrl,
        data: { message: "Nope" },
      });
    })
  );

  it.effect("should read a plain-text error body into `data`", () =>
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

  it.effect("should report an empty error body as absent", () =>
    Effect.gen(function* () {
      respondWithStatus(401);

      const error = yield* Effect.flip(getThings().pipe(withHttp()));

      expect(error).toBeInstanceOf(HttpResponseError);
      expect("data" in error ? error.data : "missing").toBeUndefined();
    })
  );

  it.live("should fail a request that exceeds the timeout", () =>
    Effect.gen(function* () {
      respondAfter(200);

      const error = yield* Effect.flip(getThings().pipe(withSlowHttp));

      expect(error._tag).toBe("TimeoutError");
    })
  );

  it.effect(
    "should count a successful request with its method, status and route",
    () =>
      Effect.gen(function* () {
        captureRequests();

        yield* getThings().pipe(withHttp());

        expect(yield* recordedRequests).toEqual([
          {
            attributes: {
              "http.request.method": "GET",
              "http.response.status_code": "200",
              "url.template": "/things",
            },
            count: 1,
          },
        ]);
      }).pipe(withMetricRegistry)
  );

  it.effect(
    "should count a request that fails with an error status as that error",
    () =>
      Effect.gen(function* () {
        respondWithStatus(503);

        yield* Effect.flip(getThings().pipe(withHttp()));

        expect(yield* recordedRequests).toEqual([
          {
            attributes: {
              "error.type": "503",
              "http.request.method": "GET",
              "http.response.status_code": "503",
              "url.template": "/things",
            },
            count: 1,
          },
        ]);
      }).pipe(withMetricRegistry)
  );

  it.live("should count a request that times out as a timeout", () =>
    Effect.gen(function* () {
      respondAfter(200);

      yield* Effect.flip(getThings().pipe(withSlowHttp));

      expect(yield* recordedRequests).toEqual([
        {
          attributes: {
            "error.type": "timeout",
            "http.request.method": "GET",
            "url.template": "/things",
          },
          count: 1,
        },
      ]);
    }).pipe(withMetricRegistry)
  );

  it.effect(
    "should record the latency of a request with the attributes of its count",
    () =>
      Effect.gen(function* () {
        respondWithStatus(404);

        yield* Effect.flip(getThings().pipe(withHttp()));

        expect(yield* recordedDurations).toEqual([
          {
            attributes: {
              "error.type": "404",
              "http.request.method": "GET",
              "http.response.status_code": "404",
              "url.template": "/things",
            },
            count: 1,
          },
        ]);
      }).pipe(withMetricRegistry)
  );

  it.effect(
    "should count a request by its route template, not its full URL",
    () =>
      Effect.gen(function* () {
        respondToAnyThing();

        yield* getPath("things/42?page=2").pipe(withHttp());

        expect(yield* recordedUrlTemplates).toEqual(["/things/{id}"]);
      }).pipe(withMetricRegistry)
  );

  it.effect(
    "should keep the transport behaviour of the provided HttpClient",
    () =>
      Effect.gen(function* () {
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

        yield* getThings().pipe(Effect.provide(layer));

        expect(requests[0]?.headers.get("x-transport")).toBe("tagged");
      })
  );

  it.effect.prop(
    "should always send the Access Token as a Bearer header",
    [accessTokenArbitrary],
    ([accessToken]) =>
      Effect.gen(function* () {
        const requests = captureRequests();

        yield* getThings().pipe(withHttp({ accessToken }));

        expect(requests[0]?.headers.get("Authorization")).toBe(
          `Bearer ${accessToken}`
        );
      }),
    ioPropertyOptions()
  );

  it.effect.prop(
    "should always fail an error status with an HttpResponseError for that status",
    [errorStatusArbitrary()],
    ([status]) =>
      Effect.gen(function* () {
        respondWithStatus(status);

        const error = yield* Effect.flip(getThings().pipe(withHttp()));

        expect(error).toBeInstanceOf(HttpResponseError);
        expect(error).toMatchObject({ status });
      }),
    ioPropertyOptions()
  );

  it.effect.prop(
    "should never end the Session for an error status other than 401",
    [errorStatusArbitrary(401)],
    ([status]) =>
      Effect.gen(function* () {
        const counter = sessionEndCounter();
        respondWithStatus(status);

        yield* Effect.flip(
          getThings().pipe(
            withHttp({ accessToken: "abc123", onEnd: counter.onEnd })
          )
        );

        expect(counter.ended).toBe(0);
      }),
    ioPropertyOptions()
  );

  it.effect.prop(
    "should always count requests to one resource under one route template",
    [resourceIdsSchema],
    ([ids]) =>
      Effect.gen(function* () {
        respondToAnyThing();

        for (const id of ids) {
          yield* getPath(`things/${id}`).pipe(withHttp());
        }

        expect(yield* recordedUrlTemplates).toEqual(["/things/{id}"]);
      }).pipe(withMetricRegistry),
    ioPropertyOptions()
  );
});
