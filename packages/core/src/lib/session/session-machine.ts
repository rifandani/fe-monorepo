import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import type { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { Effect, Schema } from "effect";

const startInputSchema = Schema.Struct({ session: authLoginResponseSchema });

const refreshInputSchema = Schema.Struct({ rejectedToken: Schema.String });

/**
 * Stand-ins for the invoked work. The real work needs the app's Persistence,
 * so `provideSessionMachine` replaces them. Keeping it out of the definition
 * keeps `sessionMachine` static, so tools can read it. The types are the
 * contract that the real work must match.
 */
const notProvided = (source: string) =>
  Effect.die(
    new Error(`The Session machine source "${source}" is not provided.`)
  );

const startNotProvided: Effect.Effect<void> = notProvided("start");

const refreshNotProvided: Effect.Effect<
  void,
  SessionRefreshError,
  SessionRefresh
> = notProvided("refresh");

const endNotProvided: Effect.Effect<void> = notProvided("end");

/**
 * @description The Session lifecycle: Session Start, Session Refresh and End
 * Session, as one statechart. A static definition: every transition is an
 * object with a literal target, so graph tools see every edge. Export it with
 * `machineToJSON`, or read it with `toDirectedGraph` from `xstate/graph`. Run
 * it through `provideSessionMachine`, which gives the work of each state.
 *
 * The Session data stays in `sessionAtom`, so it is persisted, and React and
 * the route guards read it as before. The machine owns only the work in
 * flight, which `sessionAtom` cannot show. Each state other than `idle`
 * invokes its work, and is left when the work is done:
 *
 * - `idle`: no Session work runs.
 * - `starting`: Session Start keeps the Session of a login.
 * - `refreshing`: one token refresh runs. More rejected requests while it runs
 *   start no second refresh: they wait for this one (single flight). Its work
 *   fails only when the server refuses the refresh token, and then the Session
 *   ends. Any other failure keeps the Session.
 * - `ending`: End Session discards the Session, then runs `onEnd`.
 *
 * `START` and `END` win over any work that runs: leaving a state interrupts
 * its work, so a stale refresh never writes over a new login, and a sign-out
 * never waits for the network. Callers wait for `idle` to read the result.
 */
export const sessionMachine = setupEffect({
  schemas: {
    events: {
      START: startInputSchema,
      END: Schema.Struct({}),
      ACCESS_REJECTED: Schema.Struct({ accessToken: Schema.String }),
    },
  },
  states: {
    idle: {},
    starting: { schemas: { input: startInputSchema } },
    refreshing: { schemas: { input: refreshInputSchema } },
    ending: {},
  },
  actors: {
    start: createEffectLogic({
      schemas: { input: startInputSchema },
      effect: () => startNotProvided,
    }),
    refresh: createEffectLogic({
      schemas: { input: refreshInputSchema },
      effect: () => refreshNotProvided,
    }),
    end: createEffectLogic(endNotProvided),
  },
}).createMachine({
  id: "session",
  initial: "idle",
  on: {
    // `reenter`: a second login while one is kept restarts with the new one.
    START: {
      target: ".starting",
      reenter: true,
      input: ({ event }) => ({ session: event.session }),
    },
    END: { target: ".ending" },
  },
  states: {
    idle: {
      on: {
        ACCESS_REJECTED: {
          target: "refreshing",
          input: ({ event }) => ({ rejectedToken: event.accessToken }),
        },
      },
    },
    starting: {
      invoke: {
        src: "start",
        input: ({ input }) => ({ session: input.session }),
        onDone: { target: "idle" },
        onError: { target: "idle" },
      },
    },
    refreshing: {
      invoke: {
        src: "refresh",
        input: ({ input }) => ({ rejectedToken: input.rejectedToken }),
        onDone: { target: "idle" },
        onError: { target: "ending" },
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

/** @description A state of the Session machine: the Session work that runs now. */
export type SessionActivity = "idle" | "starting" | "refreshing" | "ending";

/** @description The parts of Persistence that the Session machine owns. */
export type SessionStore = Pick<Persistence, "registry" | "sessionAtom">;

export interface SessionMachineOptions {
  /** @description More work that End Session must do in this app. */
  readonly onEnd: Effect.Effect<void>;
}

/**
 * @description `sessionMachine` with the work of each state, on one app's
 * Persistence.
 */
export const provideSessionMachine = (
  { registry, sessionAtom }: SessionStore,
  { onEnd }: SessionMachineOptions
) =>
  sessionMachine.provide({
    actors: {
      start: createEffectLogic({
        schemas: { input: startInputSchema },
        effect: ({ input }) =>
          Effect.sync(() => {
            registry.set(sessionAtom, input.session);
          }),
      }),
      // Refresh only when the rejected Access Token is still the current one.
      // When it is not, another refresh or a new login already replaced it,
      // and the caller retries with the current token.
      refresh: createEffectLogic({
        schemas: { input: refreshInputSchema },
        effect: ({ input }) =>
          Effect.gen(function* () {
            const session = registry.get(sessionAtom);

            if (
              session === null ||
              session.accessToken !== input.rejectedToken
            ) {
              return;
            }

            const service = yield* SessionRefresh;

            const tokens = yield* service.refresh(session.refreshToken).pipe(
              // Only a refused refresh token fails the work, which ends the
              // Session. Any other failure keeps it.
              Effect.catchIf(
                (error) => error.reason === "Failed",
                () => Effect.succeed(null)
              )
            );

            if (tokens !== null) {
              registry.set(sessionAtom, { ...session, ...tokens });
            }
          }),
      }),
      // Discard the Session first, so `onEnd` never sees it.
      end: createEffectLogic(
        Effect.sync(() => {
          registry.set(sessionAtom, null);
        }).pipe(Effect.andThen(onEnd))
      ),
    },
  });
