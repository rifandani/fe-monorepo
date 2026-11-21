import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { Effect, Schema } from "effect";
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

      expect(error).toMatchObject({
        _tag: "KeyValueStoreError",
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

      expect(error).toMatchObject({
        _tag: "KeyValueStoreError",
        method: "clear",
        message: "MMKV clear failed",
      });
    })
  );

  test.prop([fc.dictionary(fc.string(), fc.string())])(
    "should always read back every value it set, and list exactly those keys",
    (entries) => {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      for (const [key, value] of Object.entries(entries)) {
        Effect.runSync(store.set(key, value));
      }

      for (const [key, value] of Object.entries(entries)) {
        expect(Effect.runSync(store.get(key))).toBe(value);
      }

      expect(Effect.runSync(store.keys).toSorted()).toEqual(
        Object.keys(entries).toSorted()
      );
    }
  );

  test.prop([fc.string({ minLength: 1 })])(
    "should always name the key in the error of a failed read",
    (key) => {
      const store = makeMmkvKeyValueStore(brokenMmkv());

      const error = Effect.runSync(Effect.flip(store.get(key)));

      expect(error.message).toBe(`MMKV get failed for key ${key}`);
    }
  );
});
