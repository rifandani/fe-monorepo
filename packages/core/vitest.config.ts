import path from "node:path";

import { defineProject } from "vitest/config";

const root = import.meta.dirname;

export default defineProject({
  resolve: {
    alias: {
      "@test/msw": path.join(root, "../../vitest.msw.ts"),
      "@workspace/core": path.join(root, "src"),
    },
  },
  test: {
    name: "core",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    setupFiles: [
      path.join(root, "../../vitest.setup.ts"),
      path.join(root, "../../vitest.msw-setup.ts"),
    ],
  },
});
