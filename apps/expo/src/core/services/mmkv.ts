import { Effect, Layer } from "effect";
import { KeyValueStore } from "effect/persistence";
import { Atom } from "effect/reactivity";
import { MMKV } from "react-native-mmkv";

export const appStorageId = "app-storage" as const;

export const appStorage = new MMKV({
  encryptionKey: "fe-monorepo/expo", // simple inline key for now
  id: appStorageId,
});

/** The slice of MMKV the adapter uses, so a test can hand in an in-memory one. */
export type MmkvLike = Pick<
  MMKV,
  "clearAll" | "delete" | "getAllKeys" | "getString" | "set"
>;

const attempt = <A>(
  method: string,
  key: string | undefined,
  run: () => A
): Effect.Effect<A, KeyValueStore.KeyValueStoreError> =>
  Effect.try({
    try: run,
    catch: (cause) =>
      new KeyValueStore.KeyValueStoreError({
        method,
        key,
        message: `MMKV ${method} failed${key ? ` for key ${key}` : ""}`,
        cause,
      }),
  });

/**
 * @description An Effect `KeyValueStore` over one MMKV instance. MMKV is
 * synchronous, so atoms built on it hold the persisted value on first read.
 */
export const makeMmkvKeyValueStore = (storage: MmkvLike) =>
  KeyValueStore.makeStringOnly({
    get: (key) => attempt("get", key, () => storage.getString(key)),
    set: (key, value) => attempt("set", key, () => storage.set(key, value)),
    remove: (key) => attempt("remove", key, () => storage.delete(key)),
    clear: attempt("clear", undefined, () => storage.clearAll()),
    size: attempt("size", undefined, () => storage.getAllKeys().length),
    keys: attempt("keys", undefined, () => storage.getAllKeys()),
  });

/**
 * @description Atom runtime whose `KeyValueStore` is the app's MMKV instance.
 */
export const appStorageRuntime = Atom.runtime(
  Layer.sync(KeyValueStore.KeyValueStore, () =>
    makeMmkvKeyValueStore(appStorage)
  )
);
