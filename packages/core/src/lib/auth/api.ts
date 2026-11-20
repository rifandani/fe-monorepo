import {
  authLoginResponseSchema,
  authRefreshResponseSchema,
} from "@workspace/core/auth/schemas";
import type {
  AuthLoginRequestSchema,
  AuthRefreshRequestSchema,
} from "@workspace/core/auth/schemas";
import { Http } from "@workspace/core/http/http";
import { Effect } from "effect";
import { HttpClientRequest, HttpClientResponse } from "effect/http";

/**
 * @description Auth endpoints. Each one needs the `Http` service, so the caller's
 * Layer — not this module — decides the base URL and the Session.
 */
export const authApi = {
  login: Effect.fn("authApi.login")(function* (json: AuthLoginRequestSchema) {
    const http = yield* Http;

    const response = yield* HttpClientRequest.post("auth/login").pipe(
      HttpClientRequest.bodyJsonUnsafe(json),
      http.execute
    );

    return yield* HttpClientResponse.schemaBodyJson(authLoginResponseSchema)(
      response
    );
  }),

  /**
   * @description Exchange a refresh token for a new token pair. Send it on an
   * `Http` without the Session (`Http.layerWithoutSession`): the Access Token
   * that this request replaces was already rejected.
   */
  refresh: Effect.fn("authApi.refresh")(function* (
    json: AuthRefreshRequestSchema
  ) {
    const http = yield* Http;

    const response = yield* HttpClientRequest.post("auth/refresh").pipe(
      HttpClientRequest.bodyJsonUnsafe(json),
      http.execute
    );

    return yield* HttpClientResponse.schemaBodyJson(authRefreshResponseSchema)(
      response
    );
  }),
} as const;
