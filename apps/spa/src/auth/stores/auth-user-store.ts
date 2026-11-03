import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { persistenceKeys } from "@workspace/core/persistence/persistence";

import { persistence } from "@/core/layers/persistence";

const { registry } = persistence;

/** Key the signed-in user is persisted under in `localStorage`. */
export const authUserStoreName = persistenceKeys.session;

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
export const authUserAtom = persistence.sessionAtom;

/**
 * @description Read and write the Session outside React. Same registry as the
 * hooks, so a write here re-renders every subscriber.
 */
export const authUserStore = {
  get: () => registry.get(authUserAtom),
  set: (user: AuthLoginResponseSchema) => {
    registry.set(authUserAtom, user);
  },
  clear: () => {
    registry.set(authUserAtom, null);
  },
} as const;
