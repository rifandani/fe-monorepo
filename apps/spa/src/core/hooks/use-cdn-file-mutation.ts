/* oxlint-disable react-doctor/query-mutation-missing-invalidation */
import type { MutationState, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useMutationState } from "@tanstack/react-query";
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
}
export const useCdnFileMutation = (
  opt: Opt,
  mutationOptions?: Except<
    UseMutationOptions<GetCdnFileSuccessSchema, HTTPError, string>,
    "mutationKey" | "mutationFn"
  >
) => {
  const mutation = useMutation<GetCdnFileSuccessSchema, HTTPError, string>({
    mutationFn: (url) => cdnRepositories().getCdnFile({ url }),
    mutationKey: cdnKeys[opt.key](opt.url),
    ...mutationOptions,
  });
  return mutation;
};
export const useCdnFileMutationState = (opt: Opt) =>
  useMutationState<MutationState<GetCdnFileSuccessSchema, HTTPError, string>>({
    filters: {
      mutationKey: cdnKeys[opt.key](opt.url),
    },
  });
