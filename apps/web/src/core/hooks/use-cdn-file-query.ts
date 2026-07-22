/* oxlint-disable react/react-compiler */
import type { UndefinedInitialDataOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import type {
  CdnValidKeys,
  GetCdnFileSuccessSchema,
} from "@workspace/core/apis/cdn";
import { cdnKeys, cdnRepositories } from "@workspace/core/apis/cdn";
import type { HTTPError } from "ky";
import type { Except } from "type-fest";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
  filename?: string;
}

/**
 * Eagerly download (GET) file based on input url. Doesn't handle on error.
 */
export const useCdnFileQuery = (
  opt: Opt,
  queryOptions?: Except<
    UndefinedInitialDataOptions<unknown, HTTPError, GetCdnFileSuccessSchema>,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQuery({
    queryFn: opt.url
      ? ({ signal }) =>
          cdnRepositories().getCdnFile({ url: opt.url as string }, { signal })
      : skipToken,
    queryKey: cdnKeys[opt.key](opt.url),
    ...queryOptions,
  });
  // create file object from blob
  const file = query.data?.blob
    ? new File([query.data.blob], opt.filename ?? "unknown-filename", {
        lastModified: Date.now(),
        type: query.data.blob.type,
      })
    : null;
  return { ...query, file };
};
