import type { MutationState, UseMutationOptions } from '@tanstack/react-query'
import type { AuthLoginRequestSchema } from '@workspace/core/apis/auth'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import type { TimeoutError } from 'ky'
import type { Except } from 'type-fest'
import type { z } from 'zod'
import type { ToastCustomData } from '@/core/providers/toast/the-toast'
import { useToastController } from '@tamagui/toast'
import {
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import { authKeys, authRepositories } from '@workspace/core/apis/auth'
import { HTTPError } from 'ky'
import { http } from '@/core/services/http'

type Params = Parameters<typeof authKeys.login>[0]
type Success = Awaited<ReturnType<ReturnType<typeof authRepositories>['login']>>
type Error = HTTPError<ErrorResponseSchema> | TimeoutError | z.ZodError

/**
 * @url POST ${env.apiBaseUrl}/auth/login
 * @note includes error handling for convenience
 */
export function useAuthLogin(
  params: Params,
  mutationOptions?: Except<
    UseMutationOptions<Success, Error, Exclude<Params, undefined>>,
    'mutationKey' | 'mutationFn'
  >,
) {
  const toast = useToastController()
  const { onError, ..._mutationOptions } = mutationOptions ?? {}

  return useMutation<Success, Error, Exclude<Params, undefined>>({
    mutationKey: authKeys.login(params),
    mutationFn: json => authRepositories(http).login({ json }),
    onError: async (error, variables, context) => {
      let message = error.message
      if (error instanceof HTTPError) {
        const json = (await error.response.json())
        message = json.message
      }

      toast.show(message, {
        customData: {
          preset: 'error',
        } as ToastCustomData,
      })
      onError?.(error, variables, context)
    },
    ..._mutationOptions,
  })
}

/**
 * Get mutation state based on the mutation key.
 */
export function useAuthLoginMutationState(params: AuthLoginRequestSchema) {
  return useMutationState<
    MutationState<Success, Error, Exclude<Params, undefined>>
  >({
    filters: {
      mutationKey: authKeys.login(params),
    },
  })
}
