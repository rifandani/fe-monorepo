import { allEnvVars, makeEnvVar } from "@workspace/core/config/env-var";
import { urlStringSchema } from "@workspace/core/http/schemas";
import { ConfigProvider, Effect } from "effect";
import type { Config } from "effect";

const env = {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
};

export const envConfigProvider = ConfigProvider.fromUnknown(env);

const envVar = makeEnvVar({
  values: env,
  fix: (name) =>
    `set ${name} in the EAS project env, then run bun expo env:pull:dev (see "Environment Variables" in apps/expo/README.md)`,
});

export const EnvConfig = {
  apiBaseUrl: envVar(urlStringSchema, "EXPO_PUBLIC_API_BASE_URL"),
} as const;

const readEnv = <A>(config: Config.Config<A>): A =>
  Effect.runSync(config.parse(envConfigProvider));

readEnv(allEnvVars(EnvConfig));
