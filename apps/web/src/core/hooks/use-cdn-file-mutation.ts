import type { MutationState, UseMutationOptions } from '@tanstack/react-query'
import type { CdnValidKeys, GetCdnFileSuccessSchema } from '@workspace/core/apis/cdn'
import type { HTTPError } from 'ky'
import type { Except } from 'type-fest'
import {
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import {
  cdnKeys,
  cdnRepositories,
} from '@workspace/core/apis/cdn'

interface Opt {
  key: CdnValidKeys
  url?: string | undefined
}

/**
 * Lazily download file based on input url.
 */
export function useCdnFileMutation(
  opt: Opt,
  mutationOptions?: Except<
    UseMutationOptions<GetCdnFileSuccessSchema, HTTPError, string>,
    'mutationKey' | 'mutationFn'
  >,
) {
  const mutation = useMutation<GetCdnFileSuccessSchema, HTTPError, string>({
    mutationKey: cdnKeys[opt.key](opt.url),
    mutationFn: url => cdnRepositories().getCdnFile({ url }),
    ...mutationOptions,
  })

  return mutation
}

/**
 * Get mutation state based on the mutation key.
 */
export function useCdnFileMutationState(opt: Opt) {
  return useMutationState<
    MutationState<GetCdnFileSuccessSchema, HTTPError, string>
  >({
    filters: {
      mutationKey: cdnKeys[opt.key](opt.url),
    },
  })
}
