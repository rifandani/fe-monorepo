import { toLocale } from "@workspace/core/i18n/locale";
import { makePersistence } from "@workspace/core/persistence/persistence";
import { Layer } from "effect";
import { KeyValueStore } from "effect/persistence";
import { getLocales } from "expo-localization";

import { appStorage, makeMmkvKeyValueStore } from "@/lib/layers/mmkv";

/**
 * @description The persisted client state of this app, on MMKV.
 *
 * MMKV is synchronous, so every atom here holds its persisted value on the
 * first read. The Device Locale is only the default while no Locale is stored.
 */
export const persistence = makePersistence(
  Layer.sync(KeyValueStore.KeyValueStore, () =>
    makeMmkvKeyValueStore(appStorage)
  ),
  { defaultLocale: () => toLocale(getLocales()[0]?.languageTag) }
);
