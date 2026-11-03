import {
  mutationOptions,
  queryOptions,
  skipToken,
} from "@tanstack/react-query";
import { cdnApi } from "@workspace/core/cdn/api";
import type { GetCdnFileSuccessSchema } from "@workspace/core/cdn/schemas";
import type { ManagedRuntime } from "effect";
import type { HttpClient, HttpClientError } from "effect/http";

export type CdnValidKeys = (typeof cdnValidKeys)[keyof typeof cdnValidKeys];

export const cdnValidKeys = {
  getArticleCoverImage: "getArticleCoverImage",
} as const;

export const cdnKeys = {
  all: ["cdn"] as const,
  article: () => [...cdnKeys.all, "article"] as const,
  getArticleCoverImage: (url: string | undefined) =>
    [...cdnKeys.article(), url] as const,
};

/** @description An app runtime that can reach any URL. */
type CdnRuntime = ManagedRuntime.ManagedRuntime<HttpClient.HttpClient, unknown>;

/**
 * @description Download one CDN file. Skipped while `url` is empty. The query's
 * `signal` interrupts the Effect, which aborts the underlying fetch.
 */
export const cdnFileQueryOptions = (
  runtime: CdnRuntime,
  { key, url }: { key: CdnValidKeys; url?: string | undefined }
) =>
  queryOptions<
    GetCdnFileSuccessSchema,
    HttpClientError.HttpClientError,
    GetCdnFileSuccessSchema,
    ReturnType<(typeof cdnKeys)[CdnValidKeys]>
  >({
    queryKey: cdnKeys[key](url),
    queryFn:
      url === undefined || url === ""
        ? skipToken
        : async ({ signal }) =>
            await runtime.runPromise(cdnApi.getCdnFile({ url }), { signal }),
  });

/** @description Download a CDN file on demand; the variable is its URL. */
export const cdnFileMutationOptions = (
  runtime: CdnRuntime,
  { key, url }: { key: CdnValidKeys; url?: string | undefined }
) =>
  mutationOptions<
    GetCdnFileSuccessSchema,
    HttpClientError.HttpClientError,
    string
  >({
    mutationKey: cdnKeys[key](url),
    mutationFn: async (fileUrl) =>
      await runtime.runPromise(cdnApi.getCdnFile({ url: fileUrl })),
  });
