import type {
  GetCdnFileRequestSchema,
  GetCdnFileSuccessSchema,
} from "@workspace/core/cdn/schemas";
import { Effect } from "effect";
import { HttpClient } from "effect/http";

/**
 * @description CDN files live at absolute URLs outside the API, so these use the
 * plain transport `HttpClient` — no base URL and no Session.
 */
export const cdnApi = {
  getCdnFile: Effect.fn("cdnApi.getCdnFile")(function* ({
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

/**
 * Wrap a downloaded CDN blob in a `File` so callers get a name and a mtime,
 * or `null` while the download has not resolved.
 */
export const toCdnFile = (blob?: Blob, filename?: string) =>
  blob
    ? new File([blob], filename ?? "unknown-filename", {
        lastModified: Date.now(),
        type: blob.type,
      })
    : null;
