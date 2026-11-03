import { Http } from "@workspace/core/http/http";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/http";

import { sessionAuth } from "@/auth/utils/session-auth";
import { ENV_CLIENT } from "@/core/constants/env/client";

/**
 * @description The API client: `Http` over React Native's `fetch`, carrying the
 * Session.
 */
export const HttpLive = Http.layer({
  baseUrl: ENV_CLIENT.EXPO_PUBLIC_API_BASE_URL,
  auth: sessionAuth,
}).pipe(Layer.provide(FetchHttpClient.layer));
