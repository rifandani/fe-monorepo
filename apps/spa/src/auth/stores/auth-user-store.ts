import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Schema } from "effect";
import { Atom } from "effect/reactivity";

import {
  appRegistry,
  localStorageRuntime,
} from "@/core/services/atom-registry";

/** Key the signed-in user is persisted under in `localStorage`. */
export const authUserStoreName = "app-user" as const;

/**
 * @description The signed-in user, or `null` when there is no Session.
 *
 * Persisted to `localStorage` through `Atom.kvs`, and decoded with the login
 * response schema on every read, so a stale or hand-edited entry reads as "no
 * Session" instead of reaching the app half-shaped. `keepAlive` because route
 * guards read it outside React, where nothing else keeps the node mounted.
 *
 * @example
 *
 * ```tsx
 * const user = useAtomValue(authUserAtom);
 * ```
 */
export const authUserAtom = Atom.kvs({
  runtime: localStorageRuntime,
  key: authUserStoreName,
  schema: Schema.NullOr(authLoginResponseSchema),
  defaultValue: () => null,
}).pipe(Atom.keepAlive, Atom.withLabel("authUser"));

/**
 * @description Read and write the Session outside React. Same registry as the
 * hooks, so a write here re-renders every subscriber.
 */
export const authUserStore = {
  get: () => appRegistry.get(authUserAtom),
  set: (user: AuthLoginResponseSchema) => {
    appRegistry.set(authUserAtom, user);
  },
  clear: () => {
    appRegistry.set(authUserAtom, null);
  },
} as const;
