import type { UseQueryOptions } from '@tanstack/react-query'
import type { ErrorResponseSchema } from '@workspace/core/apis/core.api'
import type { HTTPError, TimeoutError } from 'ky'
import type { Except } from 'type-fest'
import { http } from '@/core/services/http.service'
import { skipToken, useQuery } from '@tanstack/react-query'
import { todoKeys, todoRepositories } from '@workspace/core/apis/todo.api'
import React from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

type Params = Parameters<typeof todoKeys.detail>[0]
type Success = Awaited<ReturnType<ReturnType<typeof todoRepositories>['detail']>>
type Error = ErrorResponseSchema | HTTPError | TimeoutError | ZodError

/**
 * @url GET ${env.apiBaseUrl}/todos/${id}
 * @note includes error handling in "effect" for convenience
 */
export function useTodoDetail(
  id?: Params,
  options?: Except<UseQueryOptions<unknown, Error, Success>, 'queryKey' | 'queryFn'>,
) {
  const query = useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: id
      ? ({ signal }) => todoRepositories(http).detail(id, { signal })
      : skipToken,
    ...(options && options),
  })

  React.useEffect(() => {
    if (!query.error)
      return

    if (query.error instanceof ZodError)
      toast.error(fromZodError(query.error).message)
    else toast.error(query.error.message)
  }, [query.error])

  return query
}
