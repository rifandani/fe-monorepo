import type { AuthRefreshResponseSchema } from "@workspace/core/auth/schemas";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Context, Effect, Layer } from "effect";

/**
 * @description The one way the `Session` gets a new token pair.
 *
 * This is a seam and not an import of `authApi.refresh`: `Http` needs the
 * `Session`, so the `Session` cannot need `Http`. The live adapter
 * (`auth/session-refresh.ts`) sends the refresh on an `Http` without the
 * Session. Tests give `SessionRefresh.layerRejecting` or their own stub.
 */
export class SessionRefresh extends Context.Service<
  SessionRefresh,
  {
    /** @description Exchange `refreshToken` for a new token pair. */
    readonly refresh: (
      refreshToken: string
    ) => Effect.Effect<AuthRefreshResponseSchema, SessionRefreshError>;
  }
>()("@workspace/core/session/SessionRefresh") {
  /**
   * @description A server that refuses every refresh token, so a rejected
   * Access Token ends the Session at once: the behavior without token refresh.
   * It is the default of `Session.layerMemory`.
   */
  static readonly rejecting = SessionRefresh.of({
    refresh: () => Effect.fail(new SessionRefreshError({ reason: "Rejected" })),
  });

  /** @description `SessionRefresh.rejecting` as a Layer. */
  static readonly layerRejecting = Layer.succeed(
    SessionRefresh,
    SessionRefresh.rejecting
  );
}
