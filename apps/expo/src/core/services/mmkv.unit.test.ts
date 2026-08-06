import { beforeEach, describe, expect, it, vi } from "vitest";

import { appStateStorage, appStorageId } from "./mmkv";

const { mockMMKV, MockMMKV, store } = vi.hoisted(() => {
  const memory = new Map<string, string>();
  const mmkv = {
    delete: vi.fn((key: string) => {
      memory.delete(key);
    }),
    getString: vi.fn((key: string) => memory.get(key)),
    set: vi.fn((key: string, value: string) => {
      memory.set(key, value);
    }),
  };
  // `new MMKV()` needs a real constructor — arrow `vi.fn(() => …)` is not one.
  const mmkvCtor = function mmkvCtor(_options?: {
    encryptionKey: string;
    id: string;
  }) {
    return mmkv;
  };
  return { mockMMKV: mmkv, MockMMKV: vi.fn(mmkvCtor), store: memory };
});

vi.mock("react-native-mmkv", () => ({
  MMKV: MockMMKV,
}));

describe("appStorageId", () => {
  it("is app-storage", () => {
    expect(appStorageId).toBe("app-storage");
  });
});

describe("appStorage", () => {
  it("constructs MMKV with the storage id and encryption key", () => {
    expect(MockMMKV).toHaveBeenCalledWith({
      encryptionKey: "fe-monorepo/expo",
      id: "app-storage",
    });
  });
});

describe("appStateStorage", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it("getItem returns null when missing", () => {
    expect(appStateStorage.getItem("missing")).toBeNull();
    expect(mockMMKV.getString).toHaveBeenCalledWith("missing");
  });

  it("setItem and getItem round-trip", () => {
    appStateStorage.setItem("key", "value");
    expect(mockMMKV.set).toHaveBeenCalledWith("key", "value");
    expect(appStateStorage.getItem("key")).toBe("value");
  });

  it("removeItem deletes key", () => {
    appStateStorage.setItem("key", "value");
    appStateStorage.removeItem("key");
    expect(mockMMKV.delete).toHaveBeenCalledWith("key");
    expect(appStateStorage.getItem("key")).toBeNull();
  });
});
