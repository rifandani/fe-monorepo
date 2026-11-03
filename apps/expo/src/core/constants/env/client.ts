import { urlStringSchema } from "@workspace/core/http/schemas";
import { Schema } from "effect";

const envClientSchema = Schema.Struct({
  EXPO_PUBLIC_API_BASE_URL: urlStringSchema,
});

/**
 * @description The client env, decoded once at startup.
 *
 * Each variable is read with static dot notation: Expo inlines
 * `process.env.EXPO_PUBLIC_*` at build time only when written out in full, so
 * passing `process.env` as a whole would read nothing in a release build.
 */
export const ENV_CLIENT = Schema.decodeUnknownSync(envClientSchema)({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});
