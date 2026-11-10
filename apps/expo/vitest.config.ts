import path from "node:path";

import { defineProject } from "vitest/config";

import { coreAliases } from "../../vitest.core-aliases.js";

const root = import.meta.dirname;

export default defineProject({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@test/msw": path.join(root, "../../vitest.msw.ts"),
      ...coreAliases,
    },
  },
  test: {
    name: "expo",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    setupFiles: [
      path.join(root, "../../vitest.setup.ts"),
      path.join(root, "../../vitest.msw-setup.ts"),
    ],
  },
});
