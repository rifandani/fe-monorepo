import { urlStringSchema } from "@workspace/core/apis/core";
import { Schema } from "effect";

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

const envSchema = Schema.Struct({
  VITE_API_BASE_URL: urlStringSchema,
  VITE_APP_TITLE: Schema.NonEmptyString,
  VITE_APP_URL: urlStringSchema,
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT: urlStringSchema,
  VITE_OTEL_LOG_LEVEL: Schema.Literals(otelLogLevels),
});

/**
 * @description The client env, decoded once at startup. A missing or malformed
 * variable throws here, with the offending key in the message, rather than
 * surfacing later as a broken request.
 */
export const ENV = Schema.decodeUnknownSync(envSchema)({
  VITE_API_BASE_URL: resolvedApiBaseUrl,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  VITE_APP_URL: portlessUrl ?? import.meta.env.VITE_APP_URL,
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT: import.meta.env
    .VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
  VITE_OTEL_LOG_LEVEL: import.meta.env.VITE_OTEL_LOG_LEVEL,
});
