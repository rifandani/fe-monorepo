import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import type { ActionResult } from '@/core/utils/action'
import { HTTPError, TimeoutError } from 'ky'
import { match, P } from 'ts-pattern'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { logger } from '@/core/utils/logger'
import 'server-only'

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
      logger.error(err, '[login]: Error http login')
      const json = await err.response.json<ErrorResponseSchema>()
      return { data: null, error: json.message }
    })
    .with(P.instanceOf(TimeoutError), (err) => {
      logger.error(err, '[login]: Error timeout login')
      return { data: null, error: err.message }
    })
    .with(P.instanceOf(ZodError), (err) => {
      logger.error(err, '[login]: Error zod login')
      return { data: null, error: fromZodError(err).message }
    })
    .otherwise((err) => {
      logger.error(err, '[login]: Error login')
      return { data: null, error: err.message }
    })
}
