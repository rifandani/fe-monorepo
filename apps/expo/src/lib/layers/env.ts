import { urlStringSchema } from "@workspace/core/http/schemas";
import { Config, ConfigProvider } from "effect";

const env = {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
};

export const envConfigProvider = ConfigProvider.fromUnknown(env);

export const EnvConfig = {
  apiBaseUrl: Config.schema(urlStringSchema, "EXPO_PUBLIC_API_BASE_URL"),
} as const;
