import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { provideSessionMachine } from "@workspace/core/session/session-machine";
import type { SessionActivity } from "@workspace/core/session/session-machine";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { createEffectActor, sendAndAwait, waitFor } from "@xstate/effect";
import { Context, Effect, Layer, Option } from "effect";
import { KeyValueStore } from "effect/persistence";
import { Atom } from "effect/reactivity";

/**
 * The actor stops only when the Layer closes, at app shutdown, and only then
 * do these sends and waits fail. A caller that still waits gets `fallback`.
 */
const orElseSucceed =
  <A>(fallback: A) =>
  <E>(effect: Effect.Effect<A, E>) =>
    Effect.orElseSucceed(effect, () => fallback);

/**
 * @description The Session work that runs now: the state of the Session
 * machine. `Session.layer` keeps it current in the app's registry, so React
 * reads it with `useAtomValue(sessionActivityAtom)`, for example to show that
 * a token refresh runs.
 *
 * An atom and not `createActorAtoms` from `@xstate/effect/atom`: that starts
 * a second actor, and the Session must have one.
 */
export const sessionActivityAtom = Atom.make<SessionActivity>("idle").pipe(
  Atom.keepAlive,
  Atom.withLabel("sessionActivity")
);

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
 * Access Token, refreshes it, and ends it.
 *
 * The Session itself is `sessionAtom` in Persistence, so React and route guards
 * read it with `useAtomValue` / `registry.get`. Every write goes through the
 * Session machine (`session-machine.ts`), so End Session is one flow, whether
 * the person signed out or the server refused the refresh token.
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
    /**
     * @description Session Refresh: the server rejected `rejectedToken`. Get a
     * new token pair, or end the Session when the server refuses the refresh
     * token. Many callers can ask at the same time: one refresh runs, and all
     * of them wait for it.
     *
     * @returns The Access Token to retry with, or `None` when there is none
     * (the Session ended, or the refresh failed).
     */
    readonly refresh: (
      rejectedToken: string
    ) => Effect.Effect<Option.Option<string>>;
    /** @description End Session: discard the Session, then run `onEnd`. */
    readonly end: Effect.Effect<void>;
  }
>()("@workspace/core/session/Session") {
  /**
   * @description The Session on an app's Persistence. It starts the Session
   * machine, which lives as long as the Layer, and needs `SessionRefresh`.
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
    persistence: Pick<Persistence, "registry" | "sessionAtom">,
    { onEnd = Effect.void }: SessionOptions = {}
  ) =>
    Layer.effect(
      Session,
      Effect.gen(function* () {
        const { registry, sessionAtom } = persistence;

        const actor = yield* createEffectActor(
          provideSessionMachine(persistence, { onEnd })
        );

        // Publish each state to React while the Layer lives.
        const publish = (activity: SessionActivity) => {
          registry.set(sessionActivityAtom, activity);
        };

        yield* Effect.acquireRelease(
          Effect.sync(() =>
            actor.subscribe((snapshot) => {
              publish(snapshot.value);
            })
          ),
          (subscription) =>
            Effect.sync(() => {
              subscription.unsubscribe();
              publish("idle");
            })
        );

        const accessToken = Effect.sync(() =>
          Option.fromNullishOr(registry.get(sessionAtom)?.accessToken).pipe(
            Option.filter((token) => token !== "")
          )
        );

        // `sendAndAwait` resolves once the actor took the event. The work it
        // starts runs in an invoked task, which is done when the actor is
        // back in `idle`: from then on, the atom holds the result.
        const untilIdle = waitFor(actor, (snapshot) =>
          snapshot.matches("idle")
        );

        return Session.of({
          accessToken,
          start: (session) =>
            sendAndAwait(actor, { type: "START", session }).pipe(
              Effect.andThen(untilIdle),
              Effect.ignore
            ),
          refresh: (rejectedToken) =>
            sendAndAwait(actor, {
              type: "ACCESS_REJECTED",
              accessToken: rejectedToken,
            }).pipe(
              Effect.andThen(untilIdle),
              Effect.andThen(accessToken),
              Effect.map(Option.filter((token) => token !== rejectedToken)),
              orElseSucceed(Option.none())
            ),
          end: sendAndAwait(actor, { type: "END" }).pipe(
            Effect.andThen(untilIdle),
            Effect.ignore
          ),
        });
      })
    );

  /**
   * @description A Session on in-memory storage, for tests: a second adapter at
   * the same seam. The server refuses every refresh token unless `refresh` says
   * otherwise, so a rejected Access Token ends the Session.
   */
  static readonly layerMemory = (
    session: AuthLoginResponseSchema | null = null,
    {
      refresh = SessionRefresh.rejecting,
      ...options
    }: SessionOptions & { readonly refresh?: SessionRefresh["Service"] } = {}
  ) => {
    const persistence = makePersistence(KeyValueStore.layerMemory, {
      defaultLocale: () => "en-us",
    });

    persistence.registry.set(persistence.sessionAtom, session);

    return Session.layer(persistence, options).pipe(
      Layer.provide(Layer.succeed(SessionRefresh, refresh))
    );
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
