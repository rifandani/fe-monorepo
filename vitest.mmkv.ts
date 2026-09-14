/**
 * An in-memory stand-in for `apps/expo/src/core/services/mmkv.ts`.
 *
 * Every expo test that reaches the app store transitively loads
 * `react-native-mmkv`, which Node cannot parse. Faked at the Module Boundary
 * per ADR-0002's rule of thumb — nothing about MMKV builds an HTTP request, and
 * the tests that *do* make requests still fake those at the Network Boundary.
 *
 * Lives at the repo root beside `vitest.msw.ts`, for the reason ADR-0002 gives
 * for that file: test-only code does not belong in `src/`, where the coverage
 * allowlist would demand tests for it. The return type is written out rather
 * than imported as zustand's `StateStorage`: `zustand` is an app dependency and
 * does not resolve from the root, where `msw` does.
 *
 * Each call returns a fresh backing map, so one test file cannot see another's
 * writes.
 */
export const createMmkvFake = () => {
  const store = new Map<string, string>();
  return {
    store,
    appStorageId: "app-storage" as const,
    appStateStorage: {
      getItem: (name: string): string | null => store.get(name) ?? null,
      removeItem: (name: string): void => {
        store.delete(name);
      },
      setItem: (name: string, value: string): void => {
        store.set(name, value);
      },
    },
  };
};
