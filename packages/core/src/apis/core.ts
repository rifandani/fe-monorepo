import { Schema } from "effect";

// #region COMMON SCHEMAS
/**
 * A string that parses as an absolute URL. `URL.canParse` rather than a pattern,
 * so the rule is the platform's own and not a regex that drifts from it.
 */
export const urlStringSchema = Schema.String.check(
  Schema.makeFilter((value: string) => URL.canParse(value), {
    expected: "an absolute URL",
  })
);

/**
 * A string with one `@` between a non-empty local part and a dotted domain.
 * Deliberately loose: the server owns the real address rules.
 */
export const emailStringSchema = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u, {
    expected: "an email address",
  })
);

export const errorResponseSchema = Schema.Struct({
  message: Schema.String,
});

export const resourceListRequestSchema = Schema.Struct({
  /** artificial delay in ms. */
  delay: Schema.optionalKey(Schema.Number),
  /** limit per page. limit=0 to clear */
  limit: Schema.optionalKey(
    Schema.Number.check(Schema.isBetween({ minimum: 1, maximum: 100 }))
  ),
  /** select fields. could be comma separated */
  select: Schema.optionalKey(Schema.String),
  /** skip the first n items. */
  skip: Schema.optionalKey(
    Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 100 }))
  ),
});

export const resourceListResponseSchema = Schema.Struct({
  limit: Schema.Number,
  skip: Schema.Number,
  total: Schema.Number,
});

// #endregion COMMON SCHEMAS
// #region SCHEMA TYPES
export type ErrorResponseSchema = typeof errorResponseSchema.Type;

export type ResourceListRequestSchema = typeof resourceListRequestSchema.Type;

export type ResourceListResponseSchema = typeof resourceListResponseSchema.Type;
// #endregion SCHEMA TYPES
