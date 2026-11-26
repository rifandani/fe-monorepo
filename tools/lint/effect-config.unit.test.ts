import { RuleTester } from "oxlint/plugins-dev";

import { noScatteredReadEnv as rule } from "./effect-config.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const scattered = (code: string, filename: string) => ({
  code,
  filename,
  errors: [{ messageId: "scatteredReadEnv" }],
});

tester.run("effect-config/no-scattered-read-env", rule, {
  valid: [
    {
      code: "export const env = readEnv(allEnvVars(EnvConfig));",
      filename: "apps/spa/src/lib/layers/env.ts",
    },
    {
      code: "const endpoint = readEnv(EnvConfig.otelEndpoint);",
      filename: "apps/spa/src/lib/layers/telemetry.ts",
    },
    {
      code: "readEnv(allEnvVars(EnvConfig));",
      filename: "apps/expo/src/lib/layers/env.ts",
    },
    {
      code: "const endpoint = readEnv(EnvConfig.otelEndpoint);",
      filename: "apps/spa/src/lib/layers/telemetry/exporters.ts",
    },
    {
      code: "const endpoint = readEnv(EnvConfig.otelEndpoint);",
      filename: "C:\\repo\\apps\\spa\\src\\lib\\layers\\telemetry.ts",
    },
    {
      code: "const appUrl = env.appUrl;",
      filename: "apps/spa/src/utils/seo.ts",
    },
    {
      code: "const value = config.readEnv(EnvConfig.appUrl);",
      filename: "apps/spa/src/utils/seo.ts",
    },
    {
      code: "const value = readEnvironment(EnvConfig.appUrl);",
      filename: "apps/spa/src/utils/seo.ts",
    },
  ],
  invalid: [
    scattered(
      "const appUrl = readEnv(EnvConfig.appUrl);",
      "apps/spa/src/utils/seo.ts"
    ),
    scattered(
      "const appUrl = readEnv(EnvConfig.appUrl);",
      "apps/spa/src/providers/head/provider.tsx"
    ),
    scattered(
      "const baseUrl = readEnv(EnvConfig.apiBaseUrl);",
      "apps/expo/src/features/user/api.ts"
    ),
    scattered(
      "const appUrl = readEnv(EnvConfig.appUrl);",
      "apps/spa/src/lib/layers-extra/env.ts"
    ),
    scattered(
      "const appUrl = readEnv(EnvConfig.appUrl);",
      "apps/spa/src/features/lib/layers.ts"
    ),
  ],
});
