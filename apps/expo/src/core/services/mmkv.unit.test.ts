import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { vi } from "vitest";

import { appStorageId, makeMmkvKeyValueStore } from "./mmkv";
import type { MmkvLike } from "./mmkv";

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
      memory.set(key, String(value));
    },
  };
};

describe("appStorageId", () => {
  it("is app-storage", () => {
    expect(appStorageId).toBe("app-storage");
  });
});

describe("appStorage", () => {
  it("constructs MMKV with the storage id and encryption key", async () => {
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
  it.effect("get returns undefined when missing", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      expect(yield* store.get("missing")).toBeUndefined();
    })
  );

  it.effect("set and get round-trip", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      yield* store.set("key", "value");

      expect(yield* store.get("key")).toBe("value");
      expect(yield* store.has("key")).toBe(true);
    })
  );

  it.effect("remove deletes one key", () =>
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

  it.effect("clear removes every key", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore(memoryMmkv());

      yield* store.set("a", "1");
      yield* store.clear;

      expect(yield* store.isEmpty).toBe(true);
    })
  );

  it.effect("turns a throwing MMKV call into a KeyValueStoreError", () =>
    Effect.gen(function* () {
      const store = makeMmkvKeyValueStore({
        ...memoryMmkv(),
        getString: () => {
          throw new Error("decryption failed");
        },
      });

      const error = yield* Effect.flip(store.get("key"));

      expect(error).toMatchObject({
        _tag: "KeyValueStoreError",
        method: "get",
        key: "key",
      });
    })
  );

  it.effect("names no key when a whole-store call fails", () =>
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
});
