import { Http } from "@workspace/core/http/http";
import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import { EnvConfig } from "@/lib/layers/env";
import { SessionLive } from "@/lib/layers/session";

/**
 * @description The API client: `Http` over `fetch`, carrying the Session.
 *
 * `Session` and the transport `HttpClient` stay in the context: app Effects
 * start and end the Session, and CDN requests use the plain transport.
 */
export const HttpLive = Layer.unwrap(
  Effect.gen(function* () {
    const baseUrl = yield* EnvConfig.apiBaseUrl;

    // Trace headers (`traceparent`, `b3`) make every cross-origin request a
    // CORS preflight that the API must allow. Send them only when the API is
    // same-origin — the dev proxy.
    const isSameOriginApi =
      new URL(baseUrl).origin === globalThis.location?.origin;

    return Http.layer({ baseUrl }).pipe(
      Layer.provideMerge(SessionLive),
      Layer.provideMerge(FetchHttpClient.layer),
      Layer.provideMerge(
        Layer.succeed(HttpClient.TracerPropagationEnabled, isSameOriginApi)
      )
    );
  })
);
