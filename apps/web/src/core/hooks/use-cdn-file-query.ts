import type { UndefinedInitialDataOptions } from '@tanstack/react-query'
import type { CdnValidKeys, GetCdnFileSuccessSchema } from '@workspace/core/apis/cdn'
import type { HTTPError } from 'ky'
import type { Except } from 'type-fest'
import {
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import {
  cdnKeys,
  cdnRepositories,
} from '@workspace/core/apis/cdn'

interface Opt {
  key: CdnValidKeys
  url?: string | undefined
  filename?: string
}

/**
 * Eagerly download (GET) file based on input url. Doesn't handle on error.
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

  return { ...query, file }
}
