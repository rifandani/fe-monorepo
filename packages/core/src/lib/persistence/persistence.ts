import { scheduleTask } from "@effect/atom-react";
import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import { themes } from "@workspace/core/constants/core";
import type { Theme } from "@workspace/core/constants/core";
import { localeSchema } from "@workspace/core/i18n/locale";
import type { Locale } from "@workspace/core/i18n/locale";
import { Schema } from "effect";
import type { Layer } from "effect";
import type { KeyValueStore } from "effect/persistence";
import { Atom, AtomRegistry } from "effect/reactivity";

export const persistenceKeys = {
  locale: "app-locale.v1",
  session: "app-user.v1",
  theme: "app-theme.v1",
} as const;

export interface PersistenceOptions {
  readonly defaultLocale: () => Locale;
}

export const makePersistence = (
  storage: Layer.Layer<KeyValueStore.KeyValueStore>,
  { defaultLocale }: PersistenceOptions
) => {
  const registry = AtomRegistry.make({ scheduleTask, defaultIdleTTL: 400 });

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
    schema: localeSchema,
    defaultValue: defaultLocale,
  }).pipe(Atom.keepAlive, Atom.withLabel("locale"));

  return { registry, runtime, sessionAtom, themeAtom, localeAtom } as const;
};

export type Persistence = ReturnType<typeof makePersistence>;
