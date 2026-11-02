import { authLoginResponseSchema } from "@workspace/core/apis/auth";
import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { themes } from "@workspace/core/constants/core";
import type { Theme } from "@workspace/core/constants/core";
import { Schema } from "effect";
import { Atom } from "effect/reactivity";

import { appRegistry } from "@/core/services/atom-registry";
import { appStorageRuntime } from "@/core/services/mmkv";

/** MMKV keys, one per atom, so ending a Session never touches the theme. */
export const appStoreKeys = {
  theme: "app-theme",
  user: "app-user",
} as const;

export const appStoreDefaults = {
  theme: "system",
  user: null,
} as const satisfies { theme: Theme; user: AuthLoginResponseSchema | null };

/**
 * @description The picked color theme, persisted to MMKV.
 *
 * @example
 *
 * ```tsx
 * const [theme, setTheme] = useAtom(themeAtom);
 * ```
 */
export const themeAtom = Atom.kvs({
  runtime: appStorageRuntime,
  key: appStoreKeys.theme,
  schema: Schema.Literals(themes),
  defaultValue: (): Theme => appStoreDefaults.theme,
}).pipe(Atom.keepAlive, Atom.withLabel("theme"));

/**
 * @description The signed-in user, or `null` when there is no Session.
 * Decoded with the login response schema on every read, so a stale entry reads
 * as "no Session" instead of reaching the app half-shaped.
 *
 * @example
 *
 * ```tsx
 * const user = useAtomValue(userAtom);
 * ```
 */
export const userAtom = Atom.kvs({
  runtime: appStorageRuntime,
  key: appStoreKeys.user,
  schema: Schema.NullOr(authLoginResponseSchema),
  defaultValue: () => appStoreDefaults.user,
}).pipe(Atom.keepAlive, Atom.withLabel("user"));

/**
 * @description Read and write app state outside React, on the same registry the
 * hooks subscribe to.
 */
export const appStore = {
  getTheme: () => appRegistry.get(themeAtom),
  setTheme: (theme: Theme) => {
    appRegistry.set(themeAtom, theme);
  },
  getUser: () => appRegistry.get(userAtom),
  setUser: (user: AuthLoginResponseSchema) => {
    appRegistry.set(userAtom, user);
  },
  resetUser: () => {
    appRegistry.set(userAtom, appStoreDefaults.user);
  },
  reset: () => {
    appRegistry.set(themeAtom, appStoreDefaults.theme);
    appRegistry.set(userAtom, appStoreDefaults.user);
  },
} as const;
