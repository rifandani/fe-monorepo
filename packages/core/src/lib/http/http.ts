import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { Session } from "@workspace/core/session/session";
import { Context, Duration, Effect, Layer, Option, Schema } from "effect";
import type { Cause } from "effect";
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
    )
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
