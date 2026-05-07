import type { Span } from '@opentelemetry/api'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import type { ActionResult } from '@/core/utils/action'
import { SpanStatusCode } from '@opentelemetry/api'
import {
  errorResponseSchema,
} from '@workspace/core/apis/core'
import { HTTPError, TimeoutError } from 'ky'
import { match, P } from 'ts-pattern'
import { z } from 'zod'
import { simplifyErrorObject } from '@/core/utils/error-helper'
import { log } from '@/core/utils/evlog'
import 'server-only'

/**
 * Map thrown server error to action result
 *
 * @env server
 *
 * @example
 * ```ts
 * const [errLogin, resLogin] = await tryit(authRepositories(http).login)({ json: parsedInput })
 * if (errLogin) {
 *   return await serverErrorMapper(errLogin)
 * }
 * ```
 */
export function serverErrorMapper(error: Error, span?: Span): ActionResult<null> {
  return match(error)
    .with(P.instanceOf(HTTPError), (err) => {
      const errorObject = simplifyErrorObject(err)
      const parsed = errorResponseSchema.safeParse(err.data)
      const json: ErrorResponseSchema = parsed.success
        ? parsed.data
        : { message: err.message }

      log.error({
        area: 'serverErrorMapper',
        kind: 'HTTPError',
        ...errorObject,
        response: json,
      })
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: json.message }
    })
    .with(P.instanceOf(TimeoutError), (err) => {
      const errorObject = simplifyErrorObject(err)
      log.error({
        area: 'serverErrorMapper',
        kind: 'TimeoutError',
        ...errorObject,
      })
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: err.message }
    })
    .with(P.instanceOf(z.ZodError), (err) => {
      const errorObject = simplifyErrorObject(err)
      log.error({
        area: 'serverErrorMapper',
        kind: 'ZodError',
        ...errorObject,
        response: z.prettifyError(err),
      })
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: z.prettifyError(err) }
    })
    .otherwise((err) => {
      const errorObject = simplifyErrorObject(err)
      log.error({
        area: 'serverErrorMapper',
        kind: 'UnknownError',
        ...errorObject,
      })
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: err.message }
    })
}
