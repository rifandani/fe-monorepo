import path from "node:path";

import { defineProject } from "vitest/config";

const root = import.meta.dirname;

export default defineProject({
  test: {
    name: "tooling",
    include: ["*.unit.test.ts"],
    environment: "node",
    setupFiles: [path.join(root, "../../vitest.setup.ts")],
  },
});
