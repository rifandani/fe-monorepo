import {
  emailStringSchema,
  urlStringSchema,
} from "@workspace/core/http/schemas";
import { Schema } from "effect";

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

export type GetUserApiRequestSchema = typeof getUserApiRequestSchema.Type;

export const getUserApiResponseSchema = userSchema;

export type GetUserApiResponseSchema = typeof getUserApiResponseSchema.Type;
