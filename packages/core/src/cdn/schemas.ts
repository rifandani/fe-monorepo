import type { HttpClientResponse } from "effect/http";

export interface GetCdnFileRequestSchema {
  url: string;
}

export interface GetCdnFileSuccessSchema {
  response: HttpClientResponse.HttpClientResponse;
  blob: Blob;
  headers: Record<string, string>;
}
