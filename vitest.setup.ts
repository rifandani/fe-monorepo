import { afterEach, beforeEach, vi } from "vitest";

import { resetTestEnv, testEnv } from "./vitest.env-mock";
import "./vitest.fast-check";

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) ?? null) : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
};

const localStorageMock = createMemoryStorage();
const sessionStorageMock = createMemoryStorage();

vi.stubGlobal("localStorage", localStorageMock);

vi.stubGlobal("sessionStorage", sessionStorageMock);

if (globalThis.window === undefined) {
  vi.stubGlobal("window", {
    location: { origin: "https://spa.test" },
  });
}

beforeEach(() => {
  resetTestEnv();
  localStorageMock.clear();
  sessionStorageMock.clear();
  vi.stubEnv("NODE_ENV", testEnv.get("NODE_ENV") ?? "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});
