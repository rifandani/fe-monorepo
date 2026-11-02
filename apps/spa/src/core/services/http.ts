import { Http } from "@workspace/core/services/http";
import { Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import { sessionAuth } from "@/auth/utils/session-auth";
import { ENV } from "@/core/constants/env";

/**
 * Trace headers (`traceparent`, `b3`) make every cross-origin request a CORS
 * preflight that the API must allow. Send them only when the API is same-origin
 * — the dev proxy — which is where the previous fetch instrumentation sent them.
 */
const isSameOriginApi =
  new URL(ENV.VITE_API_BASE_URL).origin === globalThis.location?.origin;

/**
 * @description The API client: `Http` over `fetch`, carrying the Session.
 */
export const HttpLive = Http.layer({
  baseUrl: ENV.VITE_API_BASE_URL,
  auth: sessionAuth,
}).pipe(
  Layer.provideMerge(FetchHttpClient.layer),
  Layer.provideMerge(
    Layer.succeed(HttpClient.TracerPropagationEnabled, isSameOriginApi)
  )
);
