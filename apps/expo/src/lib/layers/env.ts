import { urlStringSchema } from "@workspace/core/http/schemas";
import { Config, ConfigProvider } from "effect";

/**
 * The client env as Expo inlines it. Each variable is read with static dot
 * notation: Expo inlines `process.env.EXPO_PUBLIC_*` at build time only when
 * written out in full, so passing `process.env` as a whole would read nothing
 * in a release build.
 */
const env = {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
};

/**
 * @description The one `ConfigProvider` of this app, over the inlined env. The
 * app runtime installs it; a test can install another.
 */
export const envConfigProvider = ConfigProvider.fromUnknown(env);

/**
 * @description Each env value as an Effect `Config`, with the rule that decodes
 * it. Layers read these, so a missing or malformed variable fails the runtime
 * with a `ConfigError` that names the key.
 */
export const EnvConfig = {
  apiBaseUrl: Config.schema(urlStringSchema, "EXPO_PUBLIC_API_BASE_URL"),
} as const;
