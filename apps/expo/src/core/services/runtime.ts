import { ManagedRuntime } from "effect";

import { HttpLive } from "@/core/services/http";

/**
 * @description The bridge from React and TanStack Query into Effect. Built once
 * for the life of the app.
 *
 * @example
 *
 * ```ts
 * queryFn: ({ signal }) => appRuntime.runPromise(effect, { signal })
 * ```
 */
export const appRuntime = ManagedRuntime.make(HttpLive);
