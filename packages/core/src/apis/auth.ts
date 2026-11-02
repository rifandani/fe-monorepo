import { emailStringSchema, urlStringSchema } from "@workspace/core/apis/core";
import { Http } from "@workspace/core/services/http";
import { Effect, Schema } from "effect";
import { HttpClientRequest, HttpClientResponse } from "effect/http";

// #region API SCHEMAS
// Stryker disable all: Schema constraint/message mutants — ADR-0001 puts plain
// Schema shapes out of test scope; this file stays allowlisted for authKeys /
// authRepositories only (ADR-0003 accepted noise).
export const authLoginRequestSchema = Schema.Struct({
  expiresInMins: Schema.optionalKey(Schema.Number),
  password: Schema.String.check(
    Schema.isMinLength(6, {
      message: "password must contain at least 6 characters",
    })
  ),
  username: Schema.String.check(
    Schema.isMinLength(3, {
      message: "username must contain at least 3 characters",
    })
  ),
});

export const authLoginResponseSchema = Schema.Struct({
  accessToken: Schema.String,
  email: emailStringSchema,
  firstName: Schema.String,
  gender: Schema.Literals(["male", "female"]),
  id: Schema.Number.check(Schema.isGreaterThan(0)),
  image: urlStringSchema,
  lastName: Schema.String,
  refreshToken: Schema.String,
  username: Schema.String,
});

// #endregion API SCHEMAS
// #region SCHEMAS TYPES
// Stryker restore all
export type AuthLoginRequestSchema = typeof authLoginRequestSchema.Type;

export type AuthLoginResponseSchema = typeof authLoginResponseSchema.Type;

// #endregion SCHEMAS TYPES
export const authKeys = {
  all: ["auth"] as const,
  login: (params?: AuthLoginRequestSchema) =>
    [...authKeys.all, "login", ...(params ? [params] : [])] as const,
};

/**
 * @description Auth endpoints. Each one needs the `Http` service, so the caller's
 * Layer — not this module — decides the base URL and the Session.
 */
export const authRepositories = {
  login: Effect.fn("authRepositories.login")(function* (
    json: AuthLoginRequestSchema
  ) {
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
