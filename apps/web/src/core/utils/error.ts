/* oxlint-disable eslint/func-style -- function declarations */
import type { Span } from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { errorResponseSchema } from "@workspace/core/apis/core";
import { HTTPError, TimeoutError } from "ky";
import { match, P } from "ts-pattern";
import { z } from "zod";

import { simplifyErrorObject } from "@/core/utils/error-helper";
import { log } from "@/core/utils/evlog";
import "server-only";

/**
 * Maps a caught server error to a client-safe message string
 * (logs + optional span recording as a side effect).
 */
export function serverErrorMapper(error: Error, span?: Span): string {
  return (
    match(error)
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      .with(P.instanceOf(HTTPError), (err) => {
        const errorObject = simplifyErrorObject(err);
        const parsed = errorResponseSchema.safeParse(err.data);
        const json: ErrorResponseSchema = parsed.success
          ? parsed.data
          : { message: err.message };
        log.error({
          area: "serverErrorMapper",
          kind: "HTTPError",
          ...errorObject,
          response: json,
        });
        span?.recordException(errorObject);
        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        return json.message;
      })
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      .with(P.instanceOf(TimeoutError), (err) => {
        const errorObject = simplifyErrorObject(err);
        log.error({
          area: "serverErrorMapper",
          kind: "TimeoutError",
          ...errorObject,
        });
        span?.recordException(errorObject);
        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        return err.message;
      })
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      .with(P.instanceOf(z.ZodError), (err) => {
        const errorObject = simplifyErrorObject(err);
        log.error({
          area: "serverErrorMapper",
          kind: "ZodError",
          ...errorObject,
          response: z.prettifyError(err),
        });
        span?.recordException(errorObject);
        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        return z.prettifyError(err);
      })
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      .otherwise((err) => {
        const errorObject = simplifyErrorObject(err);
        log.error({
          area: "serverErrorMapper",
          kind: "UnknownError",
          ...errorObject,
        });
        span?.recordException(errorObject);
        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        return err.message;
      })
  );
}
