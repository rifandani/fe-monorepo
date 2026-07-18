import { beforeEach, describe, expect, it, vi } from "vitest";

import { appStateStorage, appStorageId } from "./mmkv";

const { mockMMKV, store } = vi.hoisted(() => {
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
  return { mockMMKV: mmkv, store: memory };
});

vi.mock("react-native-mmkv", () => {
  class MMKV {
    delete = mockMMKV.delete;
    getString = mockMMKV.getString;
    set = mockMMKV.set;
  }
  return { MMKV };
});

describe("appStorageId", () => {
  it("is app-storage", () => {
    expect(appStorageId).toBe("app-storage");
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
