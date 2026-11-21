import { urlStringSchema } from "@workspace/core/http/schemas";
import { Config, ConfigProvider, Effect, Schema } from "effect";

const portlessUrlEnv = import.meta.env.PORTLESS_URL;
const portlessUrl = portlessUrlEnv === "" ? undefined : portlessUrlEnv;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const resolvedApiBaseUrl =
  portlessUrl !== undefined &&
  apiBaseUrl?.includes("fe-monorepo.localhost") === true
    ? `${portlessUrl}/api`
    : apiBaseUrl;

export const otelLogLevels = [
  "ALL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "VERBOSE",
  "NONE",
] as const;

const env = {
  VITE_API_BASE_URL: resolvedApiBaseUrl,
  VITE_APP_URL: portlessUrl ?? import.meta.env.VITE_APP_URL,
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT: import.meta.env
    .VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
  VITE_OTEL_LOG_LEVEL: import.meta.env.VITE_OTEL_LOG_LEVEL,
};

export const envConfigProvider = ConfigProvider.fromUnknown(env);

export const EnvConfig = {
  apiBaseUrl: Config.schema(urlStringSchema, "VITE_API_BASE_URL"),
  appUrl: Config.schema(urlStringSchema, "VITE_APP_URL"),
  otelEndpoint: Config.schema(
    urlStringSchema,
    "VITE_OTEL_EXPORTER_OTLP_ENDPOINT"
  ),
  otelLogLevel: Config.schema(
    Schema.Literals(otelLogLevels),
    "VITE_OTEL_LOG_LEVEL"
  ),
} as const;

export const readEnv = <A>(config: Config.Config<A>): A =>
  Effect.runSync(config.parse(envConfigProvider));
