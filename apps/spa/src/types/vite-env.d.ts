/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string | undefined;
  readonly VITE_OTEL_EXPORTER_OTLP_ENDPOINT: string | undefined;
  readonly VITE_OTEL_LOG_LEVEL: string | undefined;
  readonly VITE_APP_URL: string | undefined;
  readonly VITE_API_BASE_URL: string | undefined;
  readonly VITE_E2E: "true" | "false" | undefined;
  readonly PORTLESS_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
