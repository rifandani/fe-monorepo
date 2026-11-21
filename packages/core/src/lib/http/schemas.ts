import { Schema } from "effect";

export const urlStringSchema = Schema.String.check(
  Schema.makeFilter((value: string) => URL.canParse(value), {
    expected: "an absolute URL",
  })
);

export const emailStringSchema = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u, {
    expected: "an email address",
  })
);

export const errorResponseSchema = Schema.Struct({
  message: Schema.String,
});

export const resourceListRequestSchema = Schema.Struct({
  delay: Schema.optionalKey(Schema.Finite),
  limit: Schema.optionalKey(
    Schema.Finite.check(Schema.isBetween({ minimum: 1, maximum: 100 }))
  ),
  select: Schema.optionalKey(Schema.String),
  skip: Schema.optionalKey(
    Schema.Finite.check(Schema.isBetween({ minimum: 0, maximum: 100 }))
  ),
});

export const resourceListResponseSchema = Schema.Struct({
  limit: Schema.Finite,
  skip: Schema.Finite,
  total: Schema.Finite,
});

export type ErrorResponseSchema = typeof errorResponseSchema.Type;

export type ResourceListRequestSchema = typeof resourceListRequestSchema.Type;

export type ResourceListResponseSchema = typeof resourceListResponseSchema.Type;
