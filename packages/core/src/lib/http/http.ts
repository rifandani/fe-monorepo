import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { Session } from "@workspace/core/session/session";
import {
  Cause,
  Clock,
  Context,
  Duration,
  Effect,
  Exit,
  Layer,
  Match,
  Metric,
  Option,
  Schema,
} from "effect";
import { constUndefined } from "effect/Function";
import { HttpClient, HttpClientRequest } from "effect/http";
import type { HttpClientError, HttpClientResponse } from "effect/http";

const defaultHeader = "Authorization";
const defaultFormat = (token: string) => `Bearer ${token}`;
const defaultTimeout = Duration.seconds(10);

export interface HttpAuthConfig {
  header?: string;
  format?: (token: string) => string;
}

export interface HttpConfig {
  baseUrl: string;
  auth?: HttpAuthConfig;
  timeout?: Duration.Input;
}

export type HttpError =
  | HttpClientError.HttpClientError
  | HttpResponseError
  | Cause.TimeoutError;

const decodeJsonBody = Schema.decodeUnknownOption(
  Schema.fromJsonString(Schema.Unknown)
);

const readErrorData = (response: HttpClientResponse.HttpClientResponse) =>
  response.text.pipe(
    Effect.map((text) =>
      text === ""
        ? undefined
        : Option.getOrElse(decodeJsonBody(text), () => text)
    ),
    Effect.orElseSucceed(constUndefined)
  );

const failOnErrorStatus = (response: HttpClientResponse.HttpClientResponse) => {
  if (response.status >= 200 && response.status < 300) {
    return Effect.succeed(response);
  }

  const { method, url } = response.request;

  return readErrorData(response).pipe(
    Effect.flatMap((data) =>
      Effect.fail(
        new HttpResponseError({
          status: response.status,
          method,
          url,
          data,
          message: `Request failed with status code ${response.status}: ${method} ${url}`,
        })
      )
    )
  );
};

const withSession =
  (session: Session["Service"], auth: HttpAuthConfig) =>
  <E, R>(client: HttpClient.HttpClient.With<E, R>) => {
    const header = auth.header ?? defaultHeader;
    const format = auth.format ?? defaultFormat;

    const send = (
      request: HttpClientRequest.HttpClientRequest,
      token: Option.Option<string>
    ) =>
      client.postprocess(
        Effect.succeed(
          Option.match(token, {
            onNone: () => request,
            onSome: (value) =>
              HttpClientRequest.setHeader(request, header, format(value)),
          })
        )
      );

    return HttpClient.transform(client, (_, request) =>
      Effect.gen(function* () {
        const token = yield* session.accessToken;
        const response = yield* send(request, token);

        if (response.status !== 401 || Option.isNone(token)) {
          return response;
        }

        const renewed = yield* session.refresh(token.value);

        return Option.isSome(renewed)
          ? yield* send(request, renewed)
          : response;
      })
    );
  };

interface RequestOutcome {
  readonly "error.type"?: string;
  readonly "http.response.status_code"?: string;
}

const requestCount = Metric.counter("http.client.requests", {
  description: "Requests sent through Http, by outcome",
  incremental: true,
});

const requestDuration = Metric.histogram("http.client.request.duration", {
  description: "Duration of a request sent through Http (ms)",
  boundaries: [
    5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10_000,
  ],
});

const idSegment =
  /^(?:\d+|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}|[\da-f]{16,})$/iu;

const urlTemplateOf = (url: string) => {
  const path = URL.canParse(url)
    ? new URL(url).pathname
    : (url.split(/[?#]/u)[0] ?? "");

  return path
    .split("/")
    .map((segment) => (idSegment.test(segment) ? "{id}" : segment))
    .join("/");
};

const statusAttributes = (status: number) => ({
  "http.response.status_code": String(status),
});

const failureAttributes = Match.type<HttpError>().pipe(
  Match.tagsExhaustive({
    HttpResponseError: (error): RequestOutcome => ({
      ...statusAttributes(error.status),
      "error.type": String(error.status),
    }),
    TimeoutError: (): RequestOutcome => ({ "error.type": "timeout" }),
    HttpClientError: (error): RequestOutcome =>
      error.response === undefined
        ? { "error.type": error.reason._tag }
        : {
            ...statusAttributes(error.response.status),
            "error.type": error.reason._tag,
          },
  })
);

const outcomeAttributes = (
  exit: Exit.Exit<HttpClientResponse.HttpClientResponse, HttpError>
): RequestOutcome =>
  Exit.isSuccess(exit)
    ? statusAttributes(exit.value.status)
    : Option.match(Cause.findErrorOption(exit.cause), {
        onNone: () => ({
          "error.type": Cause.hasInterruptsOnly(exit.cause)
            ? "cancelled"
            : "_OTHER",
        }),
        onSome: failureAttributes,
      });

const withGoldenSignals = <R>(
  client: HttpClient.HttpClient.With<HttpError, R>
) =>
  HttpClient.transform(client, (effect, request) =>
    Effect.gen(function* () {
      const startedAt = yield* Clock.currentTimeMillis;

      return yield* Effect.onExit(effect, (exit) =>
        Effect.gen(function* () {
          const endedAt = yield* Clock.currentTimeMillis;

          const attributes = {
            "http.request.method": request.method,
            "url.template": urlTemplateOf(request.url),
            ...outcomeAttributes(exit),
          };

          yield* Metric.update(
            Metric.withAttributes(requestCount, attributes),
            1
          );
          yield* Metric.update(
            Metric.withAttributes(requestDuration, attributes),
            endedAt - startedAt
          );
        })
      );
    })
  );

const makeHttpClient = (
  client: HttpClient.HttpClient,
  session: Session["Service"] | undefined,
  { auth = {}, baseUrl, timeout = defaultTimeout }: HttpConfig
): HttpClient.HttpClient.With<HttpError> => {
  const base = client.pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(baseUrl),
        HttpClientRequest.acceptJson
      )
    )
  );

  const carried =
    session === undefined ? base : withSession(session, auth)(base);

  return carried.pipe(
    HttpClient.transformResponse((response) =>
      response.pipe(Effect.flatMap(failOnErrorStatus), Effect.timeout(timeout))
    ),
    withGoldenSignals
  );
};

export class Http extends Context.Service<
  Http,
  HttpClient.HttpClient.With<HttpError>
>()("@workspace/core/http/Http") {
  static readonly layer = (config: HttpConfig) =>
    Layer.effect(
      Http,
      Effect.gen(function* () {
        return makeHttpClient(
          yield* HttpClient.HttpClient,
          yield* Session,
          config
        );
      })
    );

  static readonly layerWithoutSession = (config: Omit<HttpConfig, "auth">) =>
    Layer.effect(
      Http,
      Effect.gen(function* () {
        return makeHttpClient(yield* HttpClient.HttpClient, undefined, config);
      })
    );
}
