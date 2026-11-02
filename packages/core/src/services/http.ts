import { HttpResponseError } from "@workspace/core/services/http-response-error";
import { Context, Duration, Effect, Layer, Option, Schema } from "effect";
import type { Cause } from "effect";
import { constUndefined } from "effect/Function";
import { Headers, HttpClient, HttpClientRequest } from "effect/http";
import type { HttpClientError, HttpClientResponse } from "effect/http";

const defaultHeader = "Authorization";
const defaultFormat = (token: string) => `Bearer ${token}`;
const defaultTimeout = Duration.seconds(10);

/**
 * @description How an `Http` client proves the Session on every request.
 */
export interface HttpAuthConfig {
  /**
   * @description Read the current Access Token, or `null` when there is no Session.
   * Called per request, so login and logout need not notify the client.
   */
  getToken: () => string | null;
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
  /**
   * @description End the Session, called when the server rejects an Access Token.
   * Only fires when the rejected request actually carried one, so a failed sign-in
   * — which is a 401 with no Session to end — never triggers it.
   */
  onUnauthorized?: () => void;
}

export interface HttpConfig {
  /**
   * @description Base URL that every relative request path is resolved against.
   */
  baseUrl: string;
  /**
   * @description Optional Session auth.
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

const withAuth =
  (auth: HttpAuthConfig) =>
  <E, R>(client: HttpClient.HttpClient.With<E, R>) => {
    const header = auth.header ?? defaultHeader;
    const format = auth.format ?? defaultFormat;

    return client.pipe(
      HttpClient.mapRequest((request) => {
        const token = auth.getToken();

        return token
          ? HttpClientRequest.setHeader(request, header, format(token))
          : request;
      }),
      HttpClient.tap((response) =>
        Effect.sync(() => {
          if (response.status !== 401) {
            return;
          }

          // Only the credential *this client* sent can be the one rejected.
          // Header presence is a weaker question than that: a caller may set
          // their own, and a 401 answering someone else's credential says
          // nothing about our Session. So the header value is compared with
          // the one the current token would produce.
          const token = auth.getToken();
          const sent = Headers.get(response.request.headers, header);

          if (!token || Option.getOrUndefined(sent) !== format(token)) {
            return;
          }

          auth.onUnauthorized?.();
        })
      )
    );
  };

/**
 * @description Build the app's API client from a transport `HttpClient`.
 *
 * Resolves relative paths against `baseUrl`, asks for JSON, carries the Session
 * when `auth` is set, fails non-2xx responses with `HttpResponseError`, and
 * bounds every request with a timeout.
 */
export const makeHttpClient = (
  client: HttpClient.HttpClient,
  { auth, baseUrl, timeout = defaultTimeout }: HttpConfig
): HttpClient.HttpClient.With<HttpError> => {
  const base = client.pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(baseUrl),
        HttpClientRequest.acceptJson
      )
    )
  );

  const authed = auth ? withAuth(auth)(base) : base;

  return authed.pipe(
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
>()("@workspace/core/services/http/Http") {
  static readonly layer = (config: HttpConfig) =>
    Layer.effect(
      Http,
      Effect.gen(function* () {
        return makeHttpClient(yield* HttpClient.HttpClient, config);
      })
    );
}
