import { createEnv } from "@t3-oss/env-core";
import { vite } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

const portlessUrl =
  typeof import.meta.env.PORTLESS_URL === "string" &&
  import.meta.env.PORTLESS_URL.length > 0
    ? import.meta.env.PORTLESS_URL
    : undefined;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const resolvedApiBaseUrl =
  portlessUrl &&
  typeof apiBaseUrl === "string" &&
  apiBaseUrl.includes("fe-monorepo.localhost")
    ? `${portlessUrl}/api`
    : apiBaseUrl;

export const ENV = createEnv({
  client: {
    VITE_API_BASE_URL: z.url(),
    VITE_APP_TITLE: z.string().min(1),
    VITE_APP_URL: z.url(),
    VITE_OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    VITE_OTEL_LOG_LEVEL: z.enum([
      "ALL",
      "ERROR",
      "WARN",
      "INFO",
      "DEBUG",
      "VERBOSE",
      "NONE",
    ]),
  },
  clientPrefix: "VITE_",
  extends: [vite()],
  runtimeEnv: {
    VITE_API_BASE_URL: resolvedApiBaseUrl,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_APP_URL: portlessUrl ?? import.meta.env.VITE_APP_URL,
    VITE_OTEL_EXPORTER_OTLP_ENDPOINT: import.meta.env
      .VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
    VITE_OTEL_LOG_LEVEL: import.meta.env.VITE_OTEL_LOG_LEVEL,
  },
});
