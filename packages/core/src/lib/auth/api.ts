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
