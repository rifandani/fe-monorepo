import { authApi } from "@workspace/core/auth/api";
import { Http } from "@workspace/core/http/http";
import type { HttpConfig } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Effect, Layer } from "effect";

/** The statuses with which the server refuses a refresh token. */
const refusedStatuses: ReadonlySet<number> = new Set([401, 403]);

/**
 * @description `SessionRefresh` on `authApi.refresh`, sent by an `Http` without
 * the Session, so a refused refresh never starts another refresh. It needs only
 * the transport `HttpClient`.
 *
 * A 401 or 403 is the server refusing the refresh token (`Rejected`): End
 * Session follows. Every other failure is `Failed`, and the Session stays.
 *
 * @example
 *
 * ```ts
 * const SessionLive = Session.layer(persistence).pipe(
 *   Layer.provide(sessionRefreshLayer({ baseUrl }))
 * );
 * ```
 */
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
