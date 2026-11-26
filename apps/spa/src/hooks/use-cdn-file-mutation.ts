// fallow-ignore-file unused-file -- template hook kept for apps built from this template
import type { MutationState } from "@tanstack/react-query";
import { useMutation, useMutationState } from "@tanstack/react-query";
import { cdnFileMutationOptions, cdnKeys } from "@workspace/core/cdn/queries";
import type { CdnValidKeys } from "@workspace/core/cdn/queries";
import type { GetCdnFileSuccessSchema } from "@workspace/core/cdn/schemas";
import type { CallerMutationOptions } from "@workspace/core/http/retry-safety";
import type { HttpClientError } from "effect/http";

import { appRuntime } from "@/lib/layers/runtime";

interface Opt {
  key: CdnValidKeys;
  url?: string | undefined;
}

type CdnError = HttpClientError.HttpClientError;

export const useCdnFileMutation = (
  opt: Opt,
  mutationOptions?: CallerMutationOptions<
    GetCdnFileSuccessSchema,
    CdnError,
    string
  >
) => {
  const mutation = useMutation({
    ...mutationOptions,
    ...cdnFileMutationOptions(appRuntime, opt),
  });

  return mutation;
};

export const useCdnFileMutationState = (opt: Opt) =>
  useMutationState<MutationState<GetCdnFileSuccessSchema, CdnError, string>>({
    filters: {
      mutationKey: cdnKeys[opt.key](opt.url),
    },
  });
