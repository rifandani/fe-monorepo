import { Http } from "@workspace/core/http/http";
import {
  emailStringSchema,
  urlStringSchema,
} from "@workspace/core/http/schemas";
import type { ResourceListRequestSchema } from "@workspace/core/http/schemas";
import { Effect, Schema } from "effect";
import { HttpClientResponse } from "effect/http";

// Stryker disable all: Schema shapes — ADR-0001 plain Schema out of unit-test
// scope; file stays allowlisted for userKeys / userApi (ADR-0003).
const userSchema = Schema.Struct({
  id: Schema.Finite,
  firstName: Schema.String,
  lastName: Schema.String,
  maidenName: Schema.String,
  age: Schema.Finite,
  gender: Schema.Literals(["male", "female"]),
  email: emailStringSchema,
  phone: Schema.String,
  username: Schema.String,
  password: Schema.String,
  birthDate: Schema.String,
  image: urlStringSchema,
  bloodGroup: Schema.String,
  height: Schema.Finite,
  weight: Schema.Finite,
  eyeColor: Schema.String,
  // ... and a lot more
});

const getUserApiRequestSchema = Schema.Struct({
  id: Schema.Finite,
});

// Stryker restore all
type GetUserApiRequestSchema = typeof getUserApiRequestSchema.Type;

const getUserApiResponseSchema = userSchema;

export type GetUserApiResponseSchema = typeof getUserApiResponseSchema.Type;

export const userKeys = {
  all: ["users"] as const,
  detail: (params?: GetUserApiRequestSchema) =>
    [...userKeys.details(), ...(params ? [params] : [])] as const,
  details: () => [...userKeys.all, "detail"] as const,
  list: (params?: ResourceListRequestSchema) =>
    [...userKeys.lists(), ...(params ? [params] : [])] as const,
  lists: () => [...userKeys.all, "list"] as const,
};

/**
 * @description User endpoints. Each needs the `Http` service, so the caller's
 * Layer — not this module — decides the base URL and the Session.
 */
export const userApi = {
  getDetail: Effect.fn("userApi.getDetail")(function* ({
    id,
  }: GetUserApiRequestSchema) {
    const http = yield* Http;
    const response = yield* http.get(`users/${id}`);

    return yield* HttpClientResponse.schemaBodyJson(getUserApiResponseSchema)(
      response
    );
  }),
} as const;
