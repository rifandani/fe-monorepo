/**
 * An in-memory stand-in for the `react-native-mmkv` module.
 *
 * Every expo test that reaches the app store transitively loads
 * `react-native-mmkv`, which Node cannot parse. Faked at the Module Boundary
 * per ADR-0002's rule of thumb — nothing about MMKV builds an HTTP request, and
 * the tests that *do* make requests still fake those at the Network Boundary.
 * Faking the native module rather than `core/services/mmkv.ts` keeps that
 * file's `KeyValueStore` adapter under test.
 *
 * Lives at the repo root beside `vitest.msw.ts`, for the reason ADR-0002 gives
 * for that file: test-only code does not belong in `src/`, where the coverage
 * allowlist would demand tests for it.
 *
 * Each call returns a fresh set of backing maps, so one test file cannot see
 * another's writes. `stores` exposes them by MMKV `id` for assertions.
 */
export const createMmkvModuleFake = () => {
  const stores = new Map<string, Map<string, string>>();

  class MMKV {
    private readonly store: Map<string, string>;

    constructor(options?: { id?: string; encryptionKey?: string }) {
      const id = options?.id ?? "mmkv.default";
      const store = stores.get(id) ?? new Map<string, string>();
      stores.set(id, store);
      this.store = store;
    }

    getString(key: string): string | undefined {
      return this.store.get(key);
    }

    set(key: string, value: string): void {
      this.store.set(key, value);
    }

    delete(key: string): void {
      this.store.delete(key);
    }

    clearAll(): void {
      this.store.clear();
    }

    getAllKeys(): string[] {
      return [...this.store.keys()];
    }
  }

  return { MMKV, stores };
};
