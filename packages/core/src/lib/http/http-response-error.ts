import { Schema } from "effect";

export class HttpResponseError extends Schema.TaggedError<
  HttpResponseError,
  { readonly brand: unique symbol }
>()("HttpResponseError", {
  status: Schema.Finite,
  method: Schema.String,
  url: Schema.String,
  data: Schema.Unknown,
  message: Schema.String,
}) {}
