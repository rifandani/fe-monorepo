import 'server-only'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import type { ActionResult } from '@/core/utils/action'
import { logger } from '@workspace/core/utils/logger'
import { HTTPError, TimeoutError } from 'ky'
import { match, P } from 'ts-pattern'
import { z } from 'zod/v4'

/**
 * Map thrown repository error to action result
 *
 * @env server
 *
 * @example
 * ```ts
 * const [errLogin, resLogin] = await tryit(authRepositories(http).login)({ json: parsedInput })
 * if (errLogin) {
 *   return await repositoryErrorMapper(errLogin)
 * }
 * ```
 */
export async function repositoryErrorMapper(error: Error): Promise<ActionResult<null>> {
  return await match(error)
    .with(P.instanceOf(HTTPError), async (err) => {
      logger.error('[login]: Error http login', err)
      const json = await err.response.json<ErrorResponseSchema>()
      return { data: null, error: json.message }
    })
    .with(P.instanceOf(TimeoutError), (err) => {
      logger.error('[login]: Error timeout login', err)
      return { data: null, error: err.message }
    })
    .with(P.instanceOf(z.ZodError), (err) => {
      logger.error('[login]: Error zod login', err)
      return { data: null, error: z.prettifyError(err) }
    })
    .otherwise((err) => {
      logger.error('[login]: Error login', err)
      return { data: null, error: err.message }
    })
}
