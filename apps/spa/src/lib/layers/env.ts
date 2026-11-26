import { allEnvVars, makeEnvVar } from "@workspace/core/config/env-var";
import { urlStringSchema } from "@workspace/core/http/schemas";
import { ConfigProvider, Effect, Schema } from "effect";
import type { Config } from "effect";

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

const envValues = {
  VITE_API_BASE_URL: resolvedApiBaseUrl,
  VITE_APP_URL: portlessUrl ?? import.meta.env.VITE_APP_URL,
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT: import.meta.env.DEV
    ? globalThis.location?.origin
    : import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
  VITE_OTEL_LOG_LEVEL: import.meta.env.VITE_OTEL_LOG_LEVEL,
};

export const envConfigProvider = ConfigProvider.fromUnknown(envValues);

const envVar = makeEnvVar({
  values: envValues,
  fix: (name) =>
    `set ${name} in apps/spa/.env.local (apps/spa/.env.example lists each variable)`,
});

export const EnvConfig = {
  apiBaseUrl: envVar(urlStringSchema, "VITE_API_BASE_URL"),
  appUrl: envVar(urlStringSchema, "VITE_APP_URL"),
  otelEndpoint: envVar(urlStringSchema, "VITE_OTEL_EXPORTER_OTLP_ENDPOINT"),
  otelLogLevel: envVar(Schema.Literals(otelLogLevels), "VITE_OTEL_LOG_LEVEL"),
} as const;

const readEnv = <A>(config: Config.Config<A>): A =>
  Effect.runSync(config.parse(envConfigProvider));

export const env = readEnv(allEnvVars(EnvConfig));
