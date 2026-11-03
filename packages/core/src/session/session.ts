import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { Context, Effect, Layer, Option } from "effect";
import { KeyValueStore } from "effect/persistence";

export interface SessionOptions {
  /**
   * @description More work that End Session must do in this app, after the
   * Session is discarded — for example, clearing the query cache, so the next
   * Session never reads the previous one's data.
   */
  readonly onEnd?: Effect.Effect<void>;
}

/**
 * @description The Session of this app: the one place that starts it, reads its
 * Access Token, and ends it.
 *
 * The Session itself is `sessionAtom` in Persistence, so React and route guards
 * read it with `useAtomValue` / `registry.get`. Every write goes through here,
 * so End Session is one flow, whether the person signed out or the server
 * rejected the Access Token.
 */
export class Session extends Context.Service<
  Session,
  {
    /**
     * @description The Access Token of the current Session, or `None` when
     * there is no Session. Read per request, so a sign-in or a sign-out never
     * needs to notify a client.
     */
    readonly accessToken: Effect.Effect<Option.Option<string>>;
    /** @description Session Start: keep the Session that a login produced. */
    readonly start: (session: AuthLoginResponseSchema) => Effect.Effect<void>;
    /** @description End Session: discard the Session, then run `onEnd`. */
    readonly end: Effect.Effect<void>;
  }
>()("@workspace/core/session/Session") {
  /**
   * @description The Session on an app's Persistence.
   *
   * @example
   *
   * ```ts
   * const SessionLive = Session.layer(persistence, {
   *   onEnd: Effect.sync(() => queryClient.clear()),
   * });
   * ```
   */
  static readonly layer = (
    { registry, sessionAtom }: Pick<Persistence, "registry" | "sessionAtom">,
    { onEnd = Effect.void }: SessionOptions = {}
  ) =>
    Layer.succeed(
      Session,
      Session.of({
        accessToken: Effect.sync(() =>
          Option.fromNullishOr(registry.get(sessionAtom)?.accessToken).pipe(
            Option.filter((token) => token !== "")
          )
        ),
        start: (session) =>
          Effect.sync(() => {
            registry.set(sessionAtom, session);
          }),
        end: Effect.sync(() => {
          registry.set(sessionAtom, null);
        }).pipe(Effect.andThen(onEnd)),
      })
    );

  /**
   * @description A Session on in-memory storage, for tests: a second adapter at
   * the same seam.
   */
  static readonly layerMemory = (
    session: AuthLoginResponseSchema | null = null,
    options?: SessionOptions
  ) => {
    const persistence = makePersistence(KeyValueStore.layerMemory, {
      defaultLocale: () => "en-us",
    });

    persistence.registry.set(persistence.sessionAtom, session);

    return Session.layer(persistence, options);
  };
}

/** @description Session Start, as an Effect for the app runtime. */
export const startSession = Effect.fn("startSession")(function* (
  session: AuthLoginResponseSchema
) {
  const service = yield* Session;

  yield* service.start(session);
});

/** @description End Session, as an Effect for the app runtime. */
export const endSession = Effect.gen(function* () {
  const service = yield* Session;

  yield* service.end;
}).pipe(Effect.withSpan("endSession"));

/** @description The Access Token of the current Session, if there is one. */
export const currentAccessToken = Effect.gen(function* () {
  const service = yield* Session;

  return yield* service.accessToken;
});
