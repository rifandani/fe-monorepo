import type { AuthRefreshResponseSchema } from "@workspace/core/auth/schemas";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Context, Effect, Layer } from "effect";

export class SessionRefresh extends Context.Service<
  SessionRefresh,
  {
    readonly refresh: (
      refreshToken: string
    ) => Effect.Effect<AuthRefreshResponseSchema, SessionRefreshError>;
  }
>()("@workspace/core/session/SessionRefresh") {
  static readonly rejecting = SessionRefresh.of({
    refresh: () => Effect.fail(new SessionRefreshError({ reason: "Rejected" })),
  });

  static readonly layerRejecting = Layer.succeed(
    SessionRefresh,
    SessionRefresh.rejecting
  );
}
