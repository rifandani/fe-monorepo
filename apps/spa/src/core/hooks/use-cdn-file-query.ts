// fallow-ignore-file unused-file
/* oxlint-disable react/react-compiler */
import type { UndefinedInitialDataOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import type {
  CdnValidKeys,
  GetCdnFileSuccessSchema,
} from "@workspace/core/apis/cdn";
import { cdnKeys, cdnRepositories } from "@workspace/core/apis/cdn";
import { toCdnFile } from "@workspace/core/utils/dom";
import type { HTTPError } from "ky";
import type { Except } from "type-fest";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
  filename?: string;
}
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
          // SAFETY: this branch only runs when `opt.url` is set - the `skipToken`
          // alternative covers the empty case.
          cdnRepositories().getCdnFile({ url: opt.url as string }, { signal })
      : skipToken,
    queryKey: cdnKeys[opt.key](opt.url),
    ...queryOptions,
  });
  // create file object from blob
  const file = toCdnFile(query.data?.blob, opt.filename);
  return { ...query, file };
};
