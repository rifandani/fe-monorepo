import path from "node:path";

import { defineProject } from "vitest/config";

const root = import.meta.dirname;

export default defineProject({
  // spa tsconfig uses jsx: "preserve"; unit tests still import .tsx modules
  // (e.g. zustand store co-located with providers) so oxc must transform JSX.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@workspace/core": path.join(root, "../../packages/core/src"),
    },
  },
  test: {
    name: "spa",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    setupFiles: [path.join(root, "../../vitest.setup.ts")],
  },
});
