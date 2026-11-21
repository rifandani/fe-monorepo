export const testEnv = new Map<string, string | undefined>([
  ["NODE_ENV", "test"],
]);

export const resetTestEnv = () => {
  testEnv.clear();
  testEnv.set("NODE_ENV", "test");
};
