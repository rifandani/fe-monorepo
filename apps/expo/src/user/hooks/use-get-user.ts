import type { ErrorApiResponseSchema } from '@/core/schemas/error'
import type { GetUserApiRequest, GetUserApiResponse } from '@/user/schemas/user'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { Except } from 'type-fest'
import { userApi, userKeys } from '@/user/api/user'
import { useQuery } from '@tanstack/react-query'

/**
 * fetch single user
 */
export function useGetUser(params: GetUserApiRequest, options?: Except<
  UseQueryOptions<GetUserApiResponse, ErrorApiResponseSchema>,
    'queryKey' | 'queryFn'
>) {
  const queryKey = userKeys.detail(params)
  const queryFn = () => userApi.getDetail(params)

  return useQuery({
    ...options,
    queryKey,
    queryFn,
  })
}
