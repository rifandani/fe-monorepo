import path from "node:path";

import { defineProject } from "vitest/config";

const root = import.meta.dirname;

export default defineProject({
  // web tsconfig inherits jsx: "preserve"; unit tests still import .tsx modules
  // (e.g. seo factories). Tell the Vitest/Rolldown transform to emit automatic JSX.
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
    name: "web",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    isolate: true,
    setupFiles: [path.join(root, "../../vitest.setup.ts")],
  },
});
