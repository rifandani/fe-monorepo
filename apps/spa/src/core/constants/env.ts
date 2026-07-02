import { createEnv } from "@t3-oss/env-core";
import { vite } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

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
  runtimeEnv: import.meta.env,
});
