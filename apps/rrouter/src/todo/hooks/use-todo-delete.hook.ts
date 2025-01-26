import type { ErrorResponseSchema } from '@workspace/core/apis/core.api'
import type {
  TodoDeleteRequestSchema,
  TodoDeleteResponseSchema,
  TodoListResponseSchema,
} from '@workspace/core/apis/todo.api'
import type { TimeoutError } from 'ky'
import type { Except } from 'type-fest'
import type { ZodError } from 'zod'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { http } from '@/core/services/http.service'
import {
  type MutationState,
  useMutation,
  type UseMutationOptions,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import { todoKeys, todoRepositories } from '@workspace/core/apis/todo.api'
import { HTTPError } from 'ky'
import { toast } from 'sonner'

type Params = Parameters<typeof todoKeys.delete>[0]
type Success = Awaited<ReturnType<ReturnType<typeof todoRepositories>['delete']>>
type Error = ErrorResponseSchema | HTTPError | TimeoutError | ZodError

/**
 * @url PUT ${env.apiBaseUrl}/todos
 * @note includes error handling & `todoKeys.all` key invalidation for convenience
 */
export function useTodoDelete(
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, Error, Exclude<Params, undefined>>,
    'mutationKey' | 'mutationFn'
  >,
) {
  const { onSuccess, onError, ..._mutationOptions } = mutationOptions ?? {}
  const queryClient = useQueryClient()
  const [t] = useI18n()

  return useMutation<Success, Error, Exclude<Params, undefined>>({
    mutationKey: todoKeys.delete(params),
    mutationFn: params => todoRepositories(http).delete(params),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: todoKeys.all,
      })
      toast.success(t('xDeleteSuccess', { feature: 'Todo' }))

      onSuccess?.(data, variables, context)
    },
    onError: async (error, variables, context) => {
      if (error instanceof HTTPError) {
        const json = (await error.response.json()) as ErrorResponseSchema
        toast.error(json.message)
      }
      else {
        toast.error(error.message)
      }

      onError?.(error, variables, context)
    },
    ..._mutationOptions,
  })
}

/**
 * @url PUT ${env.apiBaseUrl}/todos
 */
export function useTodoDeleteState(params: Params) {
  return useMutationState<
    MutationState<Success, Error, Exclude<Params, undefined>>
  >({
    filters: {
      mutationKey: todoKeys.delete(params),
    },
  })
}

/**
 * @url DELETE ${env.apiBaseUrl}/todos/${id}
 * @note includes error handling in "effect" for convenience
 */
export function useTodoDeleteOptimistic(
  params: Parameters<typeof todoKeys.list>[0],
) {
  const [t] = useI18n()
  const queryClient = useQueryClient()
  const queryKey = todoKeys.list(params)

  return useMutation<
    TodoDeleteResponseSchema,
    ErrorResponseSchema,
    TodoDeleteRequestSchema,
    { previousTodosQueryResponse: TodoListResponseSchema }
  >({
    // Called before `mutationFn`:
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic Delete)
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousTodosQueryResponse
        = queryClient.getQueryData<TodoListResponseSchema>(queryKey) ?? {
          limit: Number(params?.limit ?? 10),
          todos: [],
          skip: 0,
          total: 0,
        }

      // Optimistically Delete to the new value
      queryClient.setQueryData<TodoListResponseSchema>(queryKey, {
        ...previousTodosQueryResponse,
        todos: previousTodosQueryResponse.todos.filter(
          _todo => _todo.id !== id,
        ),
      })

      // Return a context object with the snapshotted value
      return { previousTodosQueryResponse }
    },
    mutationFn: id => todoRepositories(http).delete(id),
    onSettled: (_id, error, _variables, context) => {
      toast[error ? 'error' : 'success'](
        t(error ? 'xDeleteError' : 'xDeleteSuccess', {
          feature: 'Todo',
        }),
      )

      // If the mutation fails, use the context returned from `onMutate` to roll back
      if (error) {
        queryClient.setQueryData<TodoListResponseSchema>(
          queryKey,
          context?.previousTodosQueryResponse,
        )
      }

      // if we want to refetch after error or success:
      // await queryClient.invalidateQueries({ queryKey });
    },
  })
}
