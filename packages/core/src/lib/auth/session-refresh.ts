import { authApi } from "@workspace/core/auth/api";
import { Http } from "@workspace/core/http/http";
import type { HttpConfig } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Effect, Layer } from "effect";

const refusedStatuses: ReadonlySet<number> = new Set([401, 403]);

export const sessionRefreshLayer = (config: Omit<HttpConfig, "auth">) =>
  Layer.effect(
    SessionRefresh,
    Effect.gen(function* () {
      const http = yield* Http;

      return SessionRefresh.of({
        refresh: (refreshToken) =>
          authApi.refresh({ refreshToken }).pipe(
            Effect.provideService(Http, http),
            Effect.mapError(
              (cause) =>
                new SessionRefreshError({
                  reason:
                    cause instanceof HttpResponseError &&
                    refusedStatuses.has(cause.status)
                      ? "Rejected"
                      : "Failed",
                  cause,
                })
            )
          ),
      });
    })
  ).pipe(Layer.provide(Http.layerWithoutSession(config)));
