import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import type { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { Effect, Schema } from "effect";

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

export type SessionStore = Pick<Persistence, "registry" | "sessionAtom">;

export interface SessionMachineOptions {
  readonly onEnd: Effect.Effect<void>;
}

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
      end: createEffectLogic(
        Effect.sync(() => {
          registry.set(sessionAtom, null);
        }).pipe(Effect.andThen(onEnd))
      ),
    },
  });
