/* oxlint-disable promise/prefer-await-to-callbacks */
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
 * Logs the error and records it on the span, if any.
 */
const report = (
  kind: string,
  err: Error,
  span: Span | undefined,
  response?: unknown
) => {
  const errorObject = simplifyErrorObject(err);
  log.error({
    area: "serverErrorMapper",
    kind,
    ...errorObject,
    ...(response === undefined ? {} : { response }),
  });
  span?.recordException(errorObject);
  span?.setStatus({
    code: SpanStatusCode.ERROR,
    message: err.message,
  });
};

/**
 * Maps a caught server error to a client-safe message string
 * (logs + optional span recording as a side effect).
 */
export const serverErrorMapper = (error: Error, span?: Span): string =>
  match(error)
    .with(P.instanceOf(HTTPError), (err) => {
      const parsed = errorResponseSchema.safeParse(err.data);
      const json: ErrorResponseSchema = parsed.success
        ? parsed.data
        : { message: err.message };
      report("HTTPError", err, span, json);
      return json.message;
    })
    .with(P.instanceOf(TimeoutError), (err) => {
      report("TimeoutError", err, span);
      return err.message;
    })
    .with(P.instanceOf(z.ZodError), (err) => {
      const prettified = z.prettifyError(err);
      report("ZodError", err, span, prettified);
      return prettified;
    })
    .otherwise((err) => {
      report("UnknownError", err, span);
      return err.message;
    });
