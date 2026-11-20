import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { Effect, Schema } from "effect";
import { vi } from "vitest";

import { appStorageId, makeMmkvKeyValueStore } from "./mmkv";
import type { MmkvLike } from "./mmkv";

// Helpers

const { MockMMKV } = vi.hoisted(() => {
  // This file tests the constructor options and the adapter, never the instance.
  const instance = {};

  // `new MMKV()` needs a real constructor — arrow `vi.fn(() => …)` is not one.
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

/** An in-memory `MmkvLike`, so the adapter runs against real reads and writes. */
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
      // The adapter is `makeStringOnly`, so it only ever writes strings.
      memory.set(key, decodeString(value));
    },
  };
};

/** An in-memory MMKV whose `getString` always throws, as a broken decryption does. */
const brokenMmkv = (): MmkvLike => ({
  ...memoryMmkv(),
  getString: () => {
    throw new Error("decryption failed");
  },
});

describe("appStorageId", () => {
  it("should be app-storage", () => {
    // Assert
    expect(appStorageId).toBe("app-storage");
  });
});

describe("appStorage", () => {
  it("should construct MMKV with the storage id and the encryption key", async () => {
    // Arrange
    vi.resetModules();
    MockMMKV.mockClear();

    // Act
    await import("./mmkv");

    // Assert
    expect(MockMMKV).toHaveBeenCalledWith({
      encryptionKey: "fe-monorepo/expo",
      id: "app-storage",
    });
  });
});

describe("makeMmkvKeyValueStore", () => {
  it.effect("should return undefined for a missing key", () =>
    Effect.gen(function* () {
      // Arrange
      const store = makeMmkvKeyValueStore(memoryMmkv());

      // Act
      const value = yield* store.get("missing");

      // Assert
      expect(value).toBeUndefined();
    })
  );

  it.effect("should read back a value that it set", () =>
    Effect.gen(function* () {
      // Arrange
      const store = makeMmkvKeyValueStore(memoryMmkv());

      // Act
      yield* store.set("key", "value");

      // Assert
      expect(yield* store.get("key")).toBe("value");
      expect(yield* store.has("key")).toBe(true);
    })
  );

  it.effect("should remove one key and keep the others", () =>
    Effect.gen(function* () {
      // Arrange
      const store = makeMmkvKeyValueStore(memoryMmkv());
      yield* store.set("a", "1");
      yield* store.set("b", "2");

      // Act
      yield* store.remove("a");

      // Assert
      expect(yield* store.get("a")).toBeUndefined();
      expect(yield* store.keys).toEqual(["b"]);
      expect(yield* store.size).toBe(1);
    })
  );

  it.effect("should remove every key on clear", () =>
    Effect.gen(function* () {
      // Arrange
      const store = makeMmkvKeyValueStore(memoryMmkv());
      yield* store.set("a", "1");

      // Act
      yield* store.clear;

      // Assert
      expect(yield* store.isEmpty).toBe(true);
    })
  );

  it.effect("should turn a throwing MMKV call into a KeyValueStoreError", () =>
    Effect.gen(function* () {
      // Arrange
      const store = makeMmkvKeyValueStore(brokenMmkv());

      // Act
      const error = yield* Effect.flip(store.get("key"));

      // Assert
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
      // Arrange
      const store = makeMmkvKeyValueStore({
        ...memoryMmkv(),
        clearAll: () => {
          throw new Error("locked");
        },
      });

      // Act
      const error = yield* Effect.flip(store.clear);

      // Assert
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
      // Arrange
      const store = makeMmkvKeyValueStore(memoryMmkv());

      // Act
      for (const [key, value] of Object.entries(entries)) {
        Effect.runSync(store.set(key, value));
      }

      // Assert
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
      // Arrange
      const store = makeMmkvKeyValueStore(brokenMmkv());

      // Act
      const error = Effect.runSync(Effect.flip(store.get(key)));

      // Assert
      expect(error.message).toBe(`MMKV get failed for key ${key}`);
    }
  );
});
