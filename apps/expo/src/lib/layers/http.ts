import { Http } from "@workspace/core/http/http";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";

import { EnvConfig } from "@/lib/layers/env";
import { SessionLive } from "@/lib/layers/session";

/**
 * @description The API client: `Http` over React Native's `fetch`, carrying the
 * Session.
 *
 * `Session` and the transport `HttpClient` stay in the context: app Effects
 * start and end the Session, and CDN requests use the plain transport.
 */
export const HttpLive = Layer.unwrap(
  Effect.gen(function* () {
    const baseUrl = yield* EnvConfig.apiBaseUrl;

    return Http.layer({ baseUrl }).pipe(
      Layer.provideMerge(SessionLive),
      Layer.provideMerge(FetchHttpClient.layer)
    );
  })
);
