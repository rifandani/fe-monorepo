import type { Http } from "@workspace/core/http/http";
import type { Session } from "@workspace/core/session/session";
import { ConfigProvider, Layer, ManagedRuntime } from "effect";
import type { Config } from "effect";
import type { HttpClient } from "effect/http";

import { envConfigProvider } from "@/lib/layers/env";
import { HttpLive } from "@/lib/layers/http";
import { TelemetryLive } from "@/lib/layers/telemetry";

const AppLayer: Layer.Layer<
  Http | HttpClient.HttpClient | Session,
  Config.ConfigError
> = Layer.mergeAll(HttpLive, TelemetryLive).pipe(
  Layer.provide(ConfigProvider.layer(envConfigProvider))
);

export const appRuntime = ManagedRuntime.make(AppLayer);
