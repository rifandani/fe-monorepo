import { sessionRefreshLayer } from "@workspace/core/auth/session-refresh";
import { Http } from "@workspace/core/http/http";
import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import { EnvConfig } from "@/lib/layers/env";
import { SessionLive } from "@/lib/layers/session";

export const HttpLive = Layer.unwrap(
  Effect.gen(function* () {
    const baseUrl = yield* EnvConfig.apiBaseUrl;

    const isSameOriginApi =
      new URL(baseUrl).origin === globalThis.location?.origin;

    return Http.layer({ baseUrl }).pipe(
      Layer.provideMerge(SessionLive),
      Layer.provide(sessionRefreshLayer({ baseUrl })),
      Layer.provideMerge(FetchHttpClient.layer),
      Layer.provideMerge(
        Layer.succeed(HttpClient.TracerPropagationEnabled, isSameOriginApi)
      )
    );
  })
);
