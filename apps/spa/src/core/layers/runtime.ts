import type { Http } from "@workspace/core/http/http";
import type { Session } from "@workspace/core/session/session";
import { ConfigProvider, Layer, ManagedRuntime } from "effect";
import type { Config } from "effect";
import type { HttpClient } from "effect/http";

import { envConfigProvider } from "@/core/layers/env";
import { HttpLive } from "@/core/layers/http";
import { TelemetryLive } from "@/core/layers/telemetry";

/**
 * @description Every service the app's Effects may use. The annotation is the
 * contract: `Layer`'s output is contravariant, so this fails to compile if any
 * of these services goes missing — every core endpoint needs one of them.
 */
const AppLayer: Layer.Layer<
  Http | HttpClient.HttpClient | Session,
  Config.ConfigError
> = Layer.mergeAll(HttpLive, TelemetryLive).pipe(
  Layer.provide(ConfigProvider.layer(envConfigProvider))
);

/**
 * @description The bridge from React, TanStack Query and the router into Effect.
 *
 * Built once and never disposed: an SPA lives as long as its tab.
 *
 * @example
 *
 * ```ts
 * queryFn: ({ signal }) => appRuntime.runPromise(effect, { signal })
 * ```
 */
export const appRuntime = ManagedRuntime.make(AppLayer);
