import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type {
  AuthLoginResponseSchema,
  AuthRefreshResponseSchema,
} from "@workspace/core/auth/schemas";
import type { Persistence } from "@workspace/core/persistence/persistence";
import type { SessionLock } from "@workspace/core/session/session-lock";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { Effect, Option, Result, Schema } from "effect";

const startInputSchema = Schema.Struct({ session: authLoginResponseSchema });

const refreshInputSchema = Schema.Struct({ rejectedToken: Schema.String });

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
      effect: startNotProvided,
    }),
    refresh: createEffectLogic({
      schemas: { input: refreshInputSchema },
      effect: refreshNotProvided,
    }),
    end: createEffectLogic(endNotProvided),
  },
}).createMachine({
  id: "session",
  initial: "idle",
  on: {
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

export type SessionActivity = "idle" | "starting" | "refreshing" | "ending";

export type SessionStore = Pick<
  Persistence,
  "registry" | "sessionAtom" | "reloadSession"
>;

export interface SessionMachineOptions {
  readonly onEnd: Effect.Effect<void>;
  readonly lock: SessionLock;
}

const holdsToken = (
  session: AuthLoginResponseSchema | null,
  token: string
): session is AuthLoginResponseSchema =>
  session !== null && session.accessToken === token;

const endedInAnotherTab = Effect.fail(
  new SessionRefreshError({
    reason: "Rejected",
    cause: "The stored Session ended in another tab.",
  })
);

const withStoredSession = <E, R>(
  { reloadSession }: SessionStore,
  rejectedToken: string,
  use: (session: AuthLoginResponseSchema) => Effect.Effect<void, E, R>
): Effect.Effect<void, E | SessionRefreshError, R> =>
  Effect.flatMap(
    Effect.option(reloadSession),
    (read): Effect.Effect<void, E | SessionRefreshError, R> => {
      if (Option.isNone(read)) {
        return Effect.void;
      }

      if (read.value === null) {
        return endedInAnotherTab;
      }

      return holdsToken(read.value, rejectedToken)
        ? use(read.value)
        : Effect.void;
    }
  );

const applyRefreshResult = (
  { registry, sessionAtom }: SessionStore,
  current: AuthLoginResponseSchema,
  result: Result.Result<AuthRefreshResponseSchema, SessionRefreshError>
): Effect.Effect<void, SessionRefreshError> => {
  if (Result.isSuccess(result)) {
    return Effect.sync(() => {
      registry.set(sessionAtom, { ...current, ...result.success });
    });
  }

  if (result.failure.reason === "Failed") {
    return Effect.void;
  }

  return Effect.sync(() => {
    registry.set(sessionAtom, null);
  }).pipe(Effect.andThen(Effect.fail(result.failure)));
};

const refreshUnderLock = (store: SessionStore, rejectedToken: string) =>
  withStoredSession(store, rejectedToken, (session) =>
    Effect.gen(function* () {
      const service = yield* SessionRefresh;

      const result = yield* Effect.result(
        service.refresh(session.refreshToken)
      );

      yield* withStoredSession(store, rejectedToken, (current) =>
        applyRefreshResult(store, current, result)
      );
    })
  );

export const provideSessionMachine = (
  store: SessionStore,
  { onEnd, lock }: SessionMachineOptions
) => {
  const { registry, sessionAtom } = store;

  return sessionMachine.provide({
    actors: {
      start: createEffectLogic({
        schemas: { input: startInputSchema },
        effect: ({ input }) =>
          Effect.sync(() => {
            registry.set(sessionAtom, input.session);
          }),
      }),
      refresh: createEffectLogic({
        schemas: { input: refreshInputSchema },
        effect: ({ input }) =>
          holdsToken(registry.get(sessionAtom), input.rejectedToken)
            ? lock.withLock(refreshUnderLock(store, input.rejectedToken))
            : Effect.void,
      }),
      end: createEffectLogic(
        Effect.sync(() => {
          registry.set(sessionAtom, null);
        }).pipe(Effect.andThen(onEnd))
      ),
    },
  });
};
