import { Effect } from "effect";
import { KeyValueStore } from "effect/persistence";
import { MMKV } from "react-native-mmkv";

export const appStorageId = "app-storage" as const;

export const appStorage = new MMKV({
  encryptionKey: "fe-monorepo/expo",
  id: appStorageId,
});

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
        message: `MMKV ${method} failed${key === undefined || key === "" ? "" : ` for key ${key}`}`,
        cause,
      }),
  });

export const makeMmkvKeyValueStore = (storage: MmkvLike) =>
  KeyValueStore.makeStringOnly({
    get: (key) => attempt("get", key, () => storage.getString(key)),
    set: (key, value) =>
      attempt("set", key, () => {
        storage.set(key, value);
      }),
    remove: (key) =>
      attempt("remove", key, () => {
        storage.delete(key);
      }),
    clear: attempt("clear", undefined, () => {
      storage.clearAll();
    }),
    size: attempt("size", undefined, () => storage.getAllKeys().length),
    keys: attempt("keys", undefined, () => storage.getAllKeys()),
  });
