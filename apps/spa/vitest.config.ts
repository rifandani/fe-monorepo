import path from "node:path";

import { defineProject } from "vitest/config";

import { coreAliases } from "../../vitest.core-aliases.js";

const root = import.meta.dirname;

export default defineProject({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@test/arbitraries": path.join(root, "../../vitest.arbitraries.ts"),
      ...coreAliases,
    },
  },
  test: {
    name: "spa",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    setupFiles: [path.join(root, "../../vitest.setup.ts")],
  },
});
