import type { HTTPError } from 'ky'
import type { Except } from 'type-fest'
import {
  skipToken,
  type UndefinedInitialDataOptions,
  useQuery,
} from '@tanstack/react-query'
import {
  cdnKeys,
  cdnRepositories,
  type CdnValidKeys,
  type GetCdnFileSuccessSchema,
} from '@workspace/ui/apis/cdn.api'
import React from 'react'
import { toast } from 'sonner'

interface Opt {
  key: CdnValidKeys
  url?: string | undefined
  filename?: string
}

/**
 * Eagerly download (GET) file based on input url.
 *
 * Includes error handling in "effect" for convenience.
 */
export function useCdnFileQuery(
  opt: Opt,
  queryOptions?: Except<
    UndefinedInitialDataOptions<unknown, HTTPError, GetCdnFileSuccessSchema>,
    'queryKey' | 'queryFn'
  >,
) {
  const query = useQuery({
    queryKey: cdnKeys[opt.key](opt.url),
    queryFn: opt.url
      ? ({ signal }) =>
          cdnRepositories().getCdnFile({ url: opt.url as string }, { signal })
      : skipToken,
    ...(queryOptions && queryOptions),
  })

  // create file object from blob
  const file = query.data?.blob
    ? new File([query.data.blob], opt.filename ?? 'unknown-filename', {
      type: query.data.blob.type,
      lastModified: Date.now(),
    })
    : null

  React.useEffect(() => {
    if (query.error) {
      toast.error(query.error.message)
    }
  }, [query.error])

  return { ...query, file }
}
