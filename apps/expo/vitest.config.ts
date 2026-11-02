import path from "node:path";

import { defineProject } from "vitest/config";

import { MOCK_API_BASE_URL } from "../../vitest.msw";

const root = import.meta.dirname;

export default defineProject({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@test/mmkv": path.join(root, "../../vitest.mmkv.ts"),
      "@test/msw": path.join(root, "../../vitest.msw.ts"),
      "@workspace/core": path.join(root, "../../packages/core/src"),
    },
  },
  test: {
    name: "expo",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    // Any test whose import graph reaches `src/core/services/http.ts` loads
    // `src/core/constants/env/client.ts`, which decodes `EXPO_PUBLIC_API_BASE_URL` with
    // Effect Schema at module-init time and throws without a valid URL. Expo's env reads
    // `process.env`, which is what Vitest's `env` populates (spa reads `import.meta.env`,
    // so this mechanism is expo-only).
    env: {
      EXPO_PUBLIC_API_BASE_URL: MOCK_API_BASE_URL,
    },
    setupFiles: [
      path.join(root, "../../vitest.setup.ts"),
      path.join(root, "../../vitest.msw-setup.ts"),
    ],
  },
});
