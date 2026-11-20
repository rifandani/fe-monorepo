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
 * Send the Access Token of the `Session`. When the server rejects that token
 * (a 401), ask the Session for a new one (Session Refresh) and send the request
 * once more with it. When there is no new token, the 401 stays the response:
 * the refresh ended the Session, or could not finish.
 *
 * Only a request that carried a Session token starts a refresh, so a failed
 * sign-in — a 401 with no Session — never does. The retry is sent once: a
 * second 401 is the answer.
 */
const withSession =
  (session: Session["Service"], auth: HttpAuthConfig) =>
  <E, R>(client: HttpClient.HttpClient.With<E, R>) => {
    const header = auth.header ?? defaultHeader;
    const format = auth.format ?? defaultFormat;

    // `request` is already preprocessed (base URL, `Accept`), so it goes to
    // `postprocess` and never through the preprocessing a second time.
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

/**
 * @description Build the app's API client from a transport `HttpClient`.
 *
 * Resolves relative paths against `baseUrl`, asks for JSON, carries the
 * Session, fails non-2xx responses with `HttpResponseError`, and bounds every
 * request with a timeout.
 */
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

  /**
   * @description The same API client without the Session: no Access Token and
   * no Session Refresh. For the requests that the Session itself sends, such
   * as the token refresh (`auth/session-refresh.ts`).
   */
  static readonly layerWithoutSession = (config: Omit<HttpConfig, "auth">) =>
    Layer.effect(
      Http,
      Effect.gen(function* () {
        return makeHttpClient(yield* HttpClient.HttpClient, undefined, config);
      })
    );
}
