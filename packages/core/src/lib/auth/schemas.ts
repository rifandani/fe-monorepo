import {
  emailStringSchema,
  urlStringSchema,
} from "@workspace/core/http/schemas";
import { Schema } from "effect";

export const authLoginRequestSchema = Schema.Struct({
  expiresInMins: Schema.optionalKey(Schema.Finite),
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
  id: Schema.Finite.check(Schema.isGreaterThan(0)),
  image: urlStringSchema,
  lastName: Schema.String,
  refreshToken: Schema.String,
  username: Schema.String,
});

export type AuthLoginRequestSchema = typeof authLoginRequestSchema.Type;

export type AuthLoginResponseSchema = typeof authLoginResponseSchema.Type;
