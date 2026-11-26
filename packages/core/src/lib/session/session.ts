import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import { makeMemorySessionLock } from "@workspace/core/session/session-lock";
import type { SessionLock } from "@workspace/core/session/session-lock";
import { provideSessionMachine } from "@workspace/core/session/session-machine";
import type {
  SessionActivity,
  SessionStore,
} from "@workspace/core/session/session-machine";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { createEffectActor, sendAndAwait, waitFor } from "@xstate/effect";
import { Context, Effect, Layer, Option } from "effect";
import { KeyValueStore } from "effect/persistence";
import { Atom } from "effect/reactivity";

const orElseSucceed =
  <A>(fallback: A) =>
  <E>(effect: Effect.Effect<A, E>) =>
    Effect.orElseSucceed(effect, () => fallback);

export const sessionActivityAtom = Atom.make<SessionActivity>("idle").pipe(
  Atom.keepAlive,
  Atom.withLabel("sessionActivity")
);

export interface SessionOptions {
  readonly onEnd?: Effect.Effect<void>;
  readonly lock?: SessionLock;
}

export class Session extends Context.Service<
  Session,
  {
    readonly accessToken: Effect.Effect<Option.Option<string>>;
    readonly start: (session: AuthLoginResponseSchema) => Effect.Effect<void>;
    readonly refresh: (
      rejectedToken: string
    ) => Effect.Effect<Option.Option<string>>;
    readonly end: Effect.Effect<void>;
  }
>()("@workspace/core/session/Session") {
  static readonly layer = (
    persistence: SessionStore,
    { onEnd = Effect.void, lock = makeMemorySessionLock() }: SessionOptions = {}
  ) =>
    Layer.effect(
      Session,
      Effect.gen(function* () {
        const { registry, sessionAtom } = persistence;

        const actor = yield* createEffectActor(
          provideSessionMachine(persistence, { onEnd, lock })
        );

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

export const startSession = Effect.fn("startSession")(function* (
  session: AuthLoginResponseSchema
) {
  const service = yield* Session;

  yield* service.start(session);
});

export const endSession = Effect.gen(function* () {
  const service = yield* Session;

  yield* service.end;
}).pipe(Effect.withSpan("endSession"));

export const currentAccessToken = Effect.gen(function* () {
  const service = yield* Session;

  return yield* service.accessToken;
});
