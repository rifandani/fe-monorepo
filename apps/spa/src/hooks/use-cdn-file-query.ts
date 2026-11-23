// fallow-ignore-file unused-file -- template hook kept for apps built from this template
import type { UndefinedInitialDataOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toCdnFile } from "@workspace/core/cdn/api";
import { cdnFileQueryOptions } from "@workspace/core/cdn/queries";
import type { CdnValidKeys, cdnKeys } from "@workspace/core/cdn/queries";
import type { GetCdnFileSuccessSchema } from "@workspace/core/cdn/schemas";
import type { HttpClientError } from "effect/http";
import type { Except } from "type-fest";

import { appRuntime } from "@/lib/layers/runtime";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
  filename?: string;
}

export const useCdnFileQuery = (
  opt: Opt,
  queryOptions?: Except<
    UndefinedInitialDataOptions<
      GetCdnFileSuccessSchema,
      HttpClientError.HttpClientError,
      GetCdnFileSuccessSchema,
      ReturnType<(typeof cdnKeys)[CdnValidKeys]>
    >,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQuery({
    ...cdnFileQueryOptions(appRuntime, opt),
    ...queryOptions,
  });

  const file = toCdnFile(query.data?.blob, opt.filename);

  return { ...query, file };
};
