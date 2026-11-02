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
import type { HttpClientError } from "effect/http";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/services/runtime";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
  filename?: string;
}

export const useCdnFileQuery = (
  opt: Opt,
  queryOptions?: Except<
    UndefinedInitialDataOptions<
      unknown,
      HttpClientError.HttpClientError,
      GetCdnFileSuccessSchema
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { url } = opt;

  const query = useQuery({
    // `signal` interrupts the Effect, which aborts the underlying fetch.
    queryFn: url
      ? ({ signal }) =>
          appRuntime.runPromise(cdnRepositories.getCdnFile({ url }), {
            signal,
          })
      : skipToken,
    queryKey: cdnKeys[opt.key](url),
    ...queryOptions,
  });

  // create file object from blob
  const file = toCdnFile(query.data?.blob, opt.filename);

  return { ...query, file };
};
