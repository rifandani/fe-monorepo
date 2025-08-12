import type { UseQueryOptions } from '@tanstack/react-query'
import type { HTTPError, TimeoutError } from 'ky'
import type { Except } from 'type-fest'
import type { ToastCustomData } from '@/core/providers/toast/the-toast'
import { useToastController } from '@tamagui/toast'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { userApi, userKeys } from '@/user/api/user'

type Params = Parameters<typeof userKeys.detail>[0]
type Success = Awaited<
  ReturnType<typeof userApi.getDetail>
>
type Error = z.ZodError | HTTPError | TimeoutError

/**
 * fetch single user
 */
export function useGetUser(
  params?: Params,
  options?: Except<
    UseQueryOptions<unknown, Error, Success>,
    'queryKey' | 'queryFn'
  >,
) {
  const toast = useToastController()
  const enabled = !!params

  const query = useQuery({
    queryKey: userKeys.detail(params),
    queryFn: enabled ? () => userApi.getDetail(params) : skipToken,
    ...options,
  })

  useEffect(() => {
    if (!query.error)
      return

    let message = query.error.message

    if (query.error instanceof z.ZodError) {
      message = z.prettifyError(query.error)
    }

    toast.show(message, {
      customData: {
        preset: 'error',
      } as ToastCustomData,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error])

  return query
}
