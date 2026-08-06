import path from "node:path";

import { defineProject } from "vitest/config";

import { MOCK_API_BASE_URL } from "../../vitest.msw";

const root = import.meta.dirname;

export default defineProject({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "@test/msw": path.join(root, "../../vitest.msw.ts"),
      "@workspace/core": path.join(root, "../../packages/core/src"),
    },
  },
  test: {
    name: "expo",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
    // `src/user/apis/user.ts` imports the `http` singleton, which reaches
    // `src/core/constants/env/client.ts` → `createEnv({ EXPO_PUBLIC_API_BASE_URL: z.url() })`
    // at module-init time. Faking at the Network Boundary means that graph really loads,
    // so the var must be a valid URL or `createEnv` throws before any test runs. Expo's
    // `createEnv` reads `process.env`, which is what Vitest's `env` populates (spa and web
    // read `import.meta.env`/`experimental__runtimeEnv`, so this mechanism is expo-only).
    env: {
      EXPO_PUBLIC_API_BASE_URL: MOCK_API_BASE_URL,
    },
    setupFiles: [
      path.join(root, "../../vitest.setup.ts"),
      path.join(root, "../../vitest.msw-setup.ts"),
    ],
  },
});
