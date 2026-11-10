import { makePersistence } from "@workspace/core/persistence/persistence";
import { Layer } from "effect";
import { KeyValueStore } from "effect/persistence";
import { getLocales } from "expo-localization";

import { appStorage, makeMmkvKeyValueStore } from "@/lib/layers/mmkv";
import { resolveDeviceLocale } from "@/utils/i18n";

/**
 * @description The Device Locale: the OS-preferred Locale, used while no manual
 * choice is stored.
 */
export const getDeviceLocale = () =>
  resolveDeviceLocale(getLocales()[0]?.languageTag);

/**
 * @description The persisted client state of this app, on MMKV.
 *
 * MMKV is synchronous, so every atom here holds its persisted value on the
 * first read.
 */
export const persistence = makePersistence(
  Layer.sync(KeyValueStore.KeyValueStore, () =>
    makeMmkvKeyValueStore(appStorage)
  ),
  { defaultLocale: getDeviceLocale }
);
