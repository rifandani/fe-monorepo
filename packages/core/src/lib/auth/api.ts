import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type { AuthLoginRequestSchema } from "@workspace/core/auth/schemas";
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
} as const;
