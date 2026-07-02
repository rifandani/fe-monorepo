import type { Span } from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import type { ErrorResponseSchema } from "@workspace/core/apis/core";
import { errorResponseSchema } from "@workspace/core/apis/core";
import { HTTPError, TimeoutError } from "ky";
import { z } from "zod";

import type { ActionResult } from "@/core/utils/action";
import { simplifyErrorObject } from "@/core/utils/error-helper";
import { log } from "@/core/utils/evlog";
import "server-only";

const mapHttpError = (err: HTTPError, span?: Span): ActionResult<null> => {
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
  return { data: null, error: json.message };
};

const mapTimeoutError = (
  err: TimeoutError,
  span?: Span
): ActionResult<null> => {
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
  return { data: null, error: err.message };
};

const mapZodError = (err: z.ZodError, span?: Span): ActionResult<null> => {
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
  return { data: null, error: z.prettifyError(err) };
};

const mapUnknownError = (err: Error, span?: Span): ActionResult<null> => {
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
  return { data: null, error: err.message };
};

/**
 * Map thrown server error to action result
 * Server environment.
 *
 * @example
 * ```ts
 * const [errLogin, resLogin] = await tryit(authRepositories(http).login)({ json: parsedInput })
 * if (errLogin) {
 *   return await serverErrorMapper(errLogin)
 * }
 * ```
 */
export const serverErrorMapper = (
  error: Error,
  span?: Span
): ActionResult<null> => {
  if (error instanceof HTTPError) {
    return mapHttpError(error, span);
  }
  if (error instanceof TimeoutError) {
    return mapTimeoutError(error, span);
  }
  if (error instanceof z.ZodError) {
    return mapZodError(error, span);
  }
  return mapUnknownError(error, span);
};
