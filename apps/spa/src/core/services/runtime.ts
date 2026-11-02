import { Layer, ManagedRuntime } from "effect";

import { HttpLive } from "@/core/services/http";
import { TelemetryLive } from "@/core/services/telemetry";

/**
 * @description Every service the app's Effects may need.
 */
const AppLayer = Layer.mergeAll(HttpLive, TelemetryLive);

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
