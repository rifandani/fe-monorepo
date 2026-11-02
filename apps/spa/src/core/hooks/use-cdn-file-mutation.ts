// fallow-ignore-file unused-file
/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import type { MutationState, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useMutationState } from "@tanstack/react-query";
import type {
  CdnValidKeys,
  GetCdnFileSuccessSchema,
} from "@workspace/core/apis/cdn";
import { cdnKeys, cdnRepositories } from "@workspace/core/apis/cdn";
import type { HttpClientError } from "effect/http";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/services/runtime";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
}

type CdnError = HttpClientError.HttpClientError;

export const useCdnFileMutation = (
  opt: Opt,
  mutationOptions?: Except<
    UseMutationOptions<GetCdnFileSuccessSchema, CdnError, string>,
    "mutationKey" | "mutationFn"
  >
) => {
  const mutation = useMutation<GetCdnFileSuccessSchema, CdnError, string>({
    mutationFn: async (url) =>
      await appRuntime.runPromise(cdnRepositories.getCdnFile({ url })),
    mutationKey: cdnKeys[opt.key](opt.url),
    ...mutationOptions,
  });

  return mutation;
};

export const useCdnFileMutationState = (opt: Opt) =>
  useMutationState<MutationState<GetCdnFileSuccessSchema, CdnError, string>>({
    filters: {
      mutationKey: cdnKeys[opt.key](opt.url),
    },
  });
