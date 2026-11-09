import { scheduleTask } from "@effect/atom-react";
import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import { themes } from "@workspace/core/constants/core";
import type { Theme } from "@workspace/core/constants/core";
import { Schema } from "effect";
import type { Layer } from "effect";
import type { KeyValueStore } from "effect/persistence";
import { Atom, AtomRegistry } from "effect/reactivity";

/**
 * @description The storage key of each persisted value, one key per atom, so
 * ending a Session never touches the theme or the Locale.
 */
export const persistenceKeys = {
  locale: "app-locale",
  session: "app-user",
  theme: "app-theme",
} as const;

export interface PersistenceOptions {
  /**
   * @description The Locale to use while none is stored. Called once, on the
   * first read, so it can read the browser or the device.
   */
  readonly defaultLocale: () => string;
}

/**
 * @description Build the persisted client state of one app on one
 * `KeyValueStore`.
 *
 * Each value is an `Atom.kvs`: it is decoded with its schema on every read, so a
 * stale or hand-edited entry reads as the default instead of reaching the app
 * half-shaped. Each atom is `keepAlive`, because code outside React (route
 * guards, the `Session` service) reads it where nothing keeps the node mounted.
 *
 * Call it once per app. The app gives the storage (`localStorage`, MMKV); a test
 * gives an in-memory one.
 *
 * @example
 *
 * ```ts
 * export const persistence = makePersistence(
 *   KeyValueStore.layerStorage(() => localStorage),
 *   { defaultLocale: () => navigator.language.toLowerCase() }
 * );
 * ```
 */
export const makePersistence = (
  storage: Layer.Layer<KeyValueStore.KeyValueStore>,
  { defaultLocale }: PersistenceOptions
) => {
  // The one registry of the app. React reads it through `PersistenceProvider`;
  // code outside React reads and writes the same instance.
  const registry = AtomRegistry.make({ scheduleTask, defaultIdleTTL: 400 });

  // A synchronous storage makes `Atom.kvs` hold the persisted value on the
  // first read, before any route resolves.
  const runtime = Atom.runtime(storage);

  const sessionAtom = Atom.kvs({
    runtime,
    key: persistenceKeys.session,
    schema: Schema.NullOr(authLoginResponseSchema),
    defaultValue: () => null,
  }).pipe(Atom.keepAlive, Atom.withLabel("session"));

  const themeAtom = Atom.kvs({
    runtime,
    key: persistenceKeys.theme,
    schema: Schema.Literals(themes),
    defaultValue: (): Theme => "system",
  }).pipe(Atom.keepAlive, Atom.withLabel("theme"));

  const localeAtom = Atom.kvs({
    runtime,
    key: persistenceKeys.locale,
    schema: Schema.String,
    defaultValue: defaultLocale,
  }).pipe(Atom.keepAlive, Atom.withLabel("locale"));

  return { registry, runtime, sessionAtom, themeAtom, localeAtom } as const;
};

export type Persistence = ReturnType<typeof makePersistence>;
