import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";

import { persistence } from "@/core/layers/persistence";

const { registry } = persistence;

/**
 * @description The signed-in user, or `null` when there is no Session.
 *
 * @example
 *
 * ```tsx
 * const user = useAtomValue(userAtom);
 * ```
 */
export const userAtom = persistence.sessionAtom;

/**
 * @description Read and write the Session outside React, on the same registry
 * the hooks subscribe to.
 */
export const appStore = {
  getUser: () => registry.get(userAtom),
  setUser: (user: AuthLoginResponseSchema) => {
    registry.set(userAtom, user);
  },
  resetUser: () => {
    registry.set(userAtom, null);
  },
} as const;
