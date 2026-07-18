/**
 * Mutable env bag for unit tests. Mutate via `.set` / `.get` in `beforeEach` /
 * per-test; `vitest.setup.ts` resets between files when isolate is off.
 */
export const testEnv = new Map<string, string | undefined>([
  ["NODE_ENV", "test"],
]);

export const resetTestEnv = () => {
  testEnv.clear();
  testEnv.set("NODE_ENV", "test");
};
