import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from '@tanstack/react-query'
import type {
  ErrorResponseSchema,
  ResourceListRequestSchema,
} from '@workspace/core/apis/core.api'
import type { HTTPError, TimeoutError } from 'ky'
import type { Except } from 'type-fest'
import { http } from '@/core/services/http.service'
import { todosDefaults } from '@/todo/constants/todos.constant'
import { skipToken, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  todoKeys,
  todoRepositories,
} from '@workspace/core/apis/todo.api'
import React from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

type Params = Parameters<typeof todoKeys.list>[0]
type Success = Awaited<ReturnType<ReturnType<typeof todoRepositories>['list']>>
type Error = ErrorResponseSchema | HTTPError | TimeoutError | ZodError

/**
 * @url GET ${env.apiBaseUrl}/todos
 * @note includes error handling in "effect" for convenience
 */
export function useTodoList(
  params?: Params,
  options?: Except<
    UseQueryOptions<unknown, Error, Success>,
    'queryKey' | 'queryFn'
  >,
) {
  const query = useQuery({
    queryKey: todoKeys.list(params),
    queryFn: params
      ? ({ signal }) => todoRepositories(http).list(params, { signal })
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

/**
 * @url GET ${env.apiBaseUrl}/todos
 * @note includes error handling in "effect" for convenience
 */
export function useTodoListInfinite(
  params?: Except<ResourceListRequestSchema, 'skip'> | undefined,
  options?: Except<
    UseInfiniteQueryOptions<
      Success,
      Error,
      InfiniteData<Success>,
      Success,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) {
  const infiniteQuery = useInfiniteQuery({
    queryKey: todoKeys.list(params),
    queryFn: params
      ? ({ pageParam, signal }) =>
          todoRepositories(http).list(
            {
              ...params,
              skip: (params?.limit ?? todosDefaults.skip) + pageParam,
            },
            { signal },
          )
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.total > lastPageParam ? undefined : lastPageParam + 10, // increment skip by 10
    ...(options && options),
  })

  React.useEffect(() => {
    if (!infiniteQuery.error)
      return

    if (infiniteQuery.error instanceof ZodError)
      toast.error(fromZodError(infiniteQuery.error).message)
    else toast.error(infiniteQuery.error.message)
  }, [infiniteQuery.error])

  return infiniteQuery
}
