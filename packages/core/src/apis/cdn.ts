import { Effect } from "effect";
import { HttpClient } from "effect/http";
import type { HttpClientResponse } from "effect/http";

export interface GetCdnFileRequestSchema {
  url: string;
}

export interface GetCdnFileSuccessSchema {
  response: HttpClientResponse.HttpClientResponse;
  blob: Blob;
  headers: Record<string, string>;
}

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

/**
 * @description CDN files live at absolute URLs outside the API, so these use the
 * plain transport `HttpClient` — no base URL and no Session.
 */
export const cdnRepositories = {
  getCdnFile: Effect.fn("cdnRepositories.getCdnFile")(function* ({
    url,
  }: GetCdnFileRequestSchema) {
    const client = HttpClient.filterStatusOk(yield* HttpClient.HttpClient);
    const response = yield* client.get(url);
    const buffer = yield* response.arrayBuffer;
    const headers = Object.fromEntries(Object.entries(response.headers));
    const blob = new Blob([buffer], { type: headers["content-type"] ?? "" });

    return { blob, headers, response } satisfies GetCdnFileSuccessSchema;
  }),
} as const;
