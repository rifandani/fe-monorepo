import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { KeyValueStore } from "effect/persistence";
import { vi } from "vitest";

import { appStorageId, makeMmkvKeyValueStore } from "./mmkv";
import type { MmkvLike } from "./mmkv";

const { MockMMKV } = vi.hoisted(() => {
  const instance = {};

  const mmkvCtor = function mmkvCtor(_options?: {
    encryptionKey: string;
    id: string;
  }) {
    return instance;
  };

  return { MockMMKV: vi.fn(mmkvCtor) };
});

vi.mock("react-native-mmkv", () => ({
  MMKV: MockMMKV,
}));

const decodeString = Schema.decodeUnknownSync(Schema.String);

const memoryMmkv = (): MmkvLike => {
  const memory = new Map<string, string>();

  return {
    clearAll: () => {
      memory.clear();
    },
    delete: (key) => {
      memory.delete(key);
    },
    getAllKeys: () => [...memory.keys()],
    getString: (key) => memory.get(key),
    set: (key, value) => {
      memory.set(key, decodeString(value));
    },
  };
};

const brokenMmkv = (): MmkvLike => ({
  ...memoryMmkv(),
  getString: () => {
    throw new Error("decryption failed");
  },
});

describe("appStorageId", () => {
  it("should be app-storage", () => {
    expect(appStorageId).toBe("app-storage");
  });
});

describe("appStorage", () => {
  it("should construct MMKV with the storage id and the encryption key", async () => {
    vi.resetModules();
    MockMMKV.mockClear();

    await import("./mmkv");

    expect(MockMMKV).toHaveBeenCalledWith({
      encryptionKey: "fe-monorepo/expo",
      id: "app-storage",
    });
  });
});

describe("makeMmkvKeyValueStore", () => {
  it.effect("should return undefined for a missing key", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      const value = yield* store.get("missing");

      expect(value).toBeUndefined();
    })
  );

  it.effect("should read back a value that it set", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      yield* store.set("key", "value");

      expect(yield* store.get("key")).toBe("value");
      expect(yield* store.has("key")).toBe(true);
    })
  );

  it.effect("should remove one key and keep the others", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());
      yield* store.set("a", "1");
      yield* store.set("b", "2");

      yield* store.remove("a");

      expect(yield* store.get("a")).toBeUndefined();
      expect(yield* store.keys).toEqual(["b"]);
      expect(yield* store.size).toBe(1);
    })
  );

  it.effect("should remove every key on clear", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());
      yield* store.set("a", "1");

      yield* store.clear;

      expect(yield* store.isEmpty).toBe(true);
    })
  );

  it.effect("should turn a throwing MMKV call into a KeyValueStoreError", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(brokenMmkv());

      const error = yield* Effect.flip(store.get("key"));

      expect(error).toBeInstanceOf(KeyValueStore.KeyValueStoreError);
      expect(error).toMatchObject({
        method: "get",
        key: "key",
        message: "MMKV get failed for key key",
      });
    })
  );

  it.effect("should name no key when a whole-store call fails", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore({
        ...memoryMmkv(),
        clearAll: () => {
          throw new Error("locked");
        },
      });

      const error = yield* Effect.flip(store.clear);

      expect(error).toBeInstanceOf(KeyValueStore.KeyValueStoreError);
      expect(error).toMatchObject({
        method: "clear",
        message: "MMKV clear failed",
      });
    })
  );

  it.effect.prop(
    "should always read back every value it set, and list exactly those keys",
    [Schema.Record(Schema.String, Schema.String)],
    ([entries]) =>
      Effect.gen(function* () {
        const store = makeMmkvKeyValueStore(memoryMmkv());

        for (const [key, value] of Object.entries(entries)) {
          yield* store.set(key, value);
        }

        for (const [key, value] of Object.entries(entries)) {
          expect(yield* store.get(key)).toBe(value);
        }

        expect((yield* store.keys).toSorted()).toEqual(
          Object.keys(entries).toSorted()
        );
      })
  );

  it.effect.prop(
    "should always name the key in the error of a failed read",
    [Schema.NonEmptyString],
    ([key]) =>
      Effect.gen(function* () {
        const store = makeMmkvKeyValueStore(brokenMmkv());

        const error = yield* Effect.flip(store.get(key));

        expect(error.message).toBe(`MMKV get failed for key ${key}`);
      })
  );
});
