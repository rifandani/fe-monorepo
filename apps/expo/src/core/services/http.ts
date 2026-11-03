import { Http } from "@workspace/core/http/http";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/http";

import { ENV_CLIENT } from "@/core/constants/env/client";
import { SessionLive } from "@/core/layers/session";

/**
 * @description The API client: `Http` over React Native's `fetch`, carrying the
 * Session.
 */
export const HttpLive = Http.layer({
  baseUrl: ENV_CLIENT.EXPO_PUBLIC_API_BASE_URL,
}).pipe(Layer.provideMerge(SessionLive), Layer.provide(FetchHttpClient.layer));
