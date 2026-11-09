import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { Session } from "@workspace/core/session/session";
import { Context, Duration, Effect, Layer, Option, Schema } from "effect";
import type { Cause } from "effect";
import { constUndefined } from "effect/Function";
import { Headers, HttpClient, HttpClientRequest } from "effect/http";
import type { HttpClientError, HttpClientResponse } from "effect/http";

const defaultHeader = "Authorization";
const defaultFormat = (token: string) => `Bearer ${token}`;
const defaultTimeout = Duration.seconds(10);

/**
 * @description How an `Http` client sends the Access Token of the `Session`.
 */
export interface HttpAuthConfig {
  /**
   * @description Name of the header the Access Token is sent in.
   * @default "Authorization"
   */
  header?: string;
  /**
   * @description Format the Access Token into a header value.
   * @default token => `Bearer ${token}`
   */
  format?: (token: string) => string;
}

export interface HttpConfig {
  /**
   * @description Base URL that every relative request path is resolved against.
   */
  baseUrl: string;
  /**
   * @description How the Access Token is sent.
   * @default the `Authorization` header, as `Bearer <token>`
   */
  auth?: HttpAuthConfig;
  /**
   * @description Time limit for one request, response headers included.
   * @default 10 seconds
   */
  timeout?: Duration.Input;
}

/**
 * @description Every failure the `Http` client itself can produce.
 */
export type HttpError =
  | HttpClientError.HttpClientError
  | HttpResponseError
  | Cause.TimeoutError;

const decodeJsonBody = Schema.decodeUnknownOption(
  Schema.fromJsonString(Schema.Unknown)
);

/**
 * Read a failed response's body the way the Error Envelope ladder expects it.
 * A body that cannot be read is reported as absent: the status code is still the
 * truthful part of the failure.
 */
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

/**
 * Send the Access Token of the `Session`, and end the Session when the server
 * rejects that token. A 401 ends the Session only when the rejected request
 * carried the token this client sent, so a failed sign-in — a 401 with no
 * Session to end — never ends one.
 */
const withSession =
  (session: Session["Service"], auth: HttpAuthConfig) =>
  <E, R>(client: HttpClient.HttpClient.With<E, R>) => {
    const header = auth.header ?? defaultHeader;
    const format = auth.format ?? defaultFormat;

    return client.pipe(
      HttpClient.mapRequestEffect((request) =>
        session.accessToken.pipe(
          Effect.map(
            Option.match({
              onNone: () => request,
              onSome: (token) =>
                HttpClientRequest.setHeader(request, header, format(token)),
            })
          )
        )
      ),
      HttpClient.tap((response) =>
        Effect.gen(function* () {
          if (response.status !== 401) {
            return;
          }

          // Only the credential *this client* sent can be the one rejected.
          // Header presence is a weaker question than that: a caller may set
          // their own, and a 401 answering someone else's credential says
          // nothing about our Session. So the header value is compared with
          // the one the current token would produce.
          const token = yield* session.accessToken;
          const sent = Headers.get(response.request.headers, header);

          if (
            Option.isNone(token) ||
            Option.getOrUndefined(sent) !== format(token.value)
          ) {
            return;
          }

          yield* session.end;
        })
      )
    );
  };

/**
 * @description Build the app's API client from a transport `HttpClient`.
 *
 * Resolves relative paths against `baseUrl`, asks for JSON, carries the
 * Session, fails non-2xx responses with `HttpResponseError`, and bounds every
 * request with a timeout.
 */
const makeHttpClient = (
  client: HttpClient.HttpClient,
  session: Session["Service"],
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

  return withSession(
    session,
    auth
  )(base).pipe(
    HttpClient.transformResponse((response) =>
      response.pipe(Effect.flatMap(failOnErrorStatus), Effect.timeout(timeout))
    )
  );
};

/**
 * @description The app's API client: an `HttpClient` already pointed at the API
 * and already carrying the Session.
 *
 * @example
 *
 * ```ts
 * const HttpLive = Http.layer({ baseUrl, auth }).pipe(
 *   Layer.provide(FetchHttpClient.layer)
 * );
 * ```
 */
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
}
