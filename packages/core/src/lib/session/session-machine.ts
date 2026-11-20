import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import type { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { causeFromError, createEffectLogic, setupEffect } from "@xstate/effect";
import type { EffectFailure } from "@xstate/effect";
import { Cause, Effect, Option, Schema } from "effect";

/** @description Did the server refuse the refresh token? */
const isRejected = (error: EffectFailure<SessionRefreshError>) =>
  Option.exists(
    Cause.findErrorOption(causeFromError(error)),
    (failure) => failure.reason === "Rejected"
  );

/** @description The parts of Persistence that the Session machine owns. */
export type SessionStore = Pick<Persistence, "registry" | "sessionAtom">;

export interface SessionMachineOptions {
  /** @description More work that End Session must do in this app. */
  readonly onEnd: Effect.Effect<void>;
}

/**
 * @description The Session lifecycle: Session Start, Session Refresh and End
 * Session, as one statechart.
 *
 * The Session data stays in `sessionAtom`, so it is persisted, and React and
 * the route guards read it as before. The machine owns only the work in
 * flight, which `sessionAtom` cannot show:
 *
 * - `idle`: no Session work runs.
 * - `refreshing`: one token refresh runs. More rejected requests while it runs
 *   start no second refresh: they wait for this one (single flight).
 * - `ending`: End Session runs (discard the Session, then `onEnd`).
 *
 * `START` and `END` win over a running refresh: leaving `refreshing`
 * interrupts it, so a stale refresh can never write over a new login, and a
 * sign-out never waits for the network.
 *
 * Writes to `sessionAtom` are plain actions, not Effect actions. Plain actions
 * run before the actor publishes the step, so a caller that awaits the event
 * reads the new Session. Effect actions run in a fork after the step.
 */
export const makeSessionMachine = (
  { registry, sessionAtom }: SessionStore,
  { onEnd }: SessionMachineOptions
) => {
  /**
   * Refresh only when the rejected Access Token is still the current one. When
   * it is not, another refresh or a new login already replaced it, and the
   * caller can retry with the current token. `None`: no refresh was needed.
   */
  const refresh = createEffectLogic({
    schemas: { input: Schema.Struct({ rejectedToken: Schema.String }) },
    effect: ({ input }) =>
      Effect.gen(function* () {
        const session = registry.get(sessionAtom);

        if (session === null || session.accessToken !== input.rejectedToken) {
          return Option.none();
        }

        const service = yield* SessionRefresh;

        return Option.some(yield* service.refresh(session.refreshToken));
      }),
  });

  /** Discard the Session first, so `onEnd` never sees it. */
  const end = createEffectLogic(
    Effect.sync(() => {
      registry.set(sessionAtom, null);
    }).pipe(Effect.andThen(onEnd))
  );

  return setupEffect({
    schemas: {
      events: {
        START: Schema.Struct({ session: authLoginResponseSchema }),
        END: Schema.Struct({}),
        ACCESS_REJECTED: Schema.Struct({ accessToken: Schema.String }),
      },
    },
    states: {
      idle: {},
      refreshing: {
        schemas: { input: Schema.Struct({ rejectedToken: Schema.String }) },
      },
      ending: {},
    },
    actors: { refresh, end },
  }).createMachine({
    id: "session",
    initial: "idle",
    on: {
      START: ({ event }, enq) => {
        enq(() => {
          registry.set(sessionAtom, event.session);
        });

        return { target: ".idle" };
      },
      END: { target: ".ending" },
    },
    states: {
      idle: {
        on: {
          ACCESS_REJECTED: ({ event }) => ({
            target: "refreshing",
            input: { rejectedToken: event.accessToken },
          }),
        },
      },
      refreshing: {
        invoke: {
          src: "refresh",
          input: ({ input }) => ({ rejectedToken: input.rejectedToken }),
          onDone: ({ event }, enq) => {
            const tokens = event.output;

            if (Option.isSome(tokens)) {
              enq(() => {
                const session = registry.get(sessionAtom);

                if (session !== null) {
                  registry.set(sessionAtom, { ...session, ...tokens.value });
                }
              });
            }

            return { target: "idle" };
          },
          // A refused refresh token ends the Session. Any other failure keeps
          // it: the server did not say that the Session is invalid.
          onError: ({ event }) =>
            isRejected(event.error) ? { target: "ending" } : { target: "idle" },
        },
      },
      ending: {
        invoke: {
          src: "end",
          onDone: { target: "idle" },
          onError: { target: "idle" },
        },
      },
    },
  });
};

export type SessionMachine = ReturnType<typeof makeSessionMachine>;
