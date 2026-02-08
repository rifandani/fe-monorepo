import 'server-only'

import type { ActionResult } from '@/core/utils/action'
import { Logger } from '@/core/utils/logger'
import type { Span } from '@opentelemetry/api'
import { SpanStatusCode } from '@opentelemetry/api'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import { HTTPError, TimeoutError } from 'ky'
import { match, P } from 'ts-pattern'
import { z } from 'zod'

const logger = new Logger('action.error')

/**
 * Simplify error object to a more readable format
 */
export function simplifyErrorObject(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
}

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
export async function serverErrorMapper(error: Error, span?: Span): Promise<ActionResult<null>> {
  return await match(error)
    .with(P.instanceOf(HTTPError), async (err) => {
      const errorObject = simplifyErrorObject(err)
      const json = await err.response.json<ErrorResponseSchema>()

      logger.error('[login]: Error http login', {
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
      logger.error('[login]: Error timeout login', errorObject)
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: err.message }
    })
    .with(P.instanceOf(z.ZodError), (err) => {
      const errorObject = simplifyErrorObject(err)
      logger.error('[login]: Error zod login', {
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
      logger.error('[login]: Error login', errorObject)
      span?.recordException(errorObject)
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      })

      return { data: null, error: err.message }
    })
}
