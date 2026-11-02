import { Schema } from "effect";

/**
 * @description The server answered, but not with a 2xx.
 *
 * `data` is the response body: parsed JSON when it is JSON, the raw text when it
 * is not, and absent when it is empty. `toErrorMessage` reads the Error Envelope
 * from it.
 */
export class HttpResponseError extends Schema.TaggedError<HttpResponseError>()(
  "HttpResponseError",
  {
    status: Schema.Number,
    method: Schema.String,
    url: Schema.String,
    data: Schema.Unknown,
    message: Schema.String,
  }
) {}
