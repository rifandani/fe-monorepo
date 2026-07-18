import path from "node:path";

import { defineProject } from "vitest/config";

const root = import.meta.dirname;

export default defineProject({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@workspace/core": path.join(root, "../../packages/core/src"),
    },
  },
  test: {
    name: "expo",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    setupFiles: [path.join(root, "../../vitest.setup.ts")],
  },
});
