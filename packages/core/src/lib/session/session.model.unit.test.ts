import { setImmediate as nextMacrotask } from "node:timers/promises";

import { fc } from "@fast-check/vitest";
import { sessionArb } from "@test/arbitraries";
import type {
  AuthLoginResponseSchema,
  AuthRefreshResponseSchema,
} from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import { Session, sessionActivityAtom } from "@workspace/core/session/session";
import type { SessionActivity } from "@workspace/core/session/session-machine";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { assertTestCoverage, propertyTest } from "@xstate/test";
import type { TestSut } from "@xstate/test";
import { Deferred, Effect, Layer, ManagedRuntime } from "effect";
import { KeyValueStore } from "effect/persistence";
import { describe, test } from "vitest";
import { createMachine, types } from "xstate";
import type { EventFrom, SnapshotFrom } from "xstate";

type RefreshResponse =
  | { readonly result: "tokens"; readonly tokens: AuthRefreshResponseSchema }
  | { readonly result: "refused" }
  | { readonly result: "failed" };

interface Projection {
  readonly session: AuthLoginResponseSchema | null;
  readonly activity: SessionActivity;
  readonly refreshCalls: number;
}

const sessionModel = createMachine({
  id: "sessionModel",
  schemas: {
    context: types<{
      readonly session: AuthLoginResponseSchema | null;
      readonly refreshCalls: number;
    }>(),
    events: {
      LOGIN: types<{ readonly session: AuthLoginResponseSchema }>(),
      SIGN_OUT: types<object>(),
      REQUEST_REJECTED: types<{ readonly accessToken: string }>(),
      REFRESH_RESPONDS: types<{ readonly response: RefreshResponse }>(),
    },
  },
  context: { session: null, refreshCalls: 0 },
  initial: "idle",
  on: {
    LOGIN: ({ context, event }) => ({
      target: ".idle",
      context: { ...context, session: event.session },
    }),
    SIGN_OUT: ({ context }) => ({
      target: ".idle",
      context: { ...context, session: null },
    }),
  },
  states: {
    idle: {
      on: {
        REQUEST_REJECTED: ({ context, event }) =>
          context.session?.accessToken === event.accessToken
            ? {
                target: "refreshing",
                context: { ...context, refreshCalls: context.refreshCalls + 1 },
              }
            : undefined,
      },
    },
    refreshing: {
      on: {
        REFRESH_RESPONDS: ({ context, event }) => {
          const { response } = event;

          if (response.result === "refused") {
            return { target: "idle", context: { ...context, session: null } };
          }

          if (response.result === "failed" || context.session === null) {
            return { target: "idle" };
          }

          return {
            target: "idle",
            context: {
              ...context,
              session: { ...context.session, ...response.tokens },
            },
          };
        },
      },
    },
  },
});

type ModelSnapshot = SnapshotFrom<typeof sessionModel>;

type ModelEvent = EventFrom<typeof sessionModel>;

const refreshResponseArb: fc.Arbitrary<RefreshResponse> = fc.oneof(
  fc.record({
    result: fc.constant("tokens" as const),
    tokens: fc.record({ accessToken: fc.string(), refreshToken: fc.string() }),
  }),
  fc.constant({ result: "refused" as const }),
  fc.constant({ result: "failed" as const })
);

const isRefreshing = ({ snapshot }: { readonly snapshot: ModelSnapshot }) =>
  snapshot.matches("refreshing");

const events = {
  LOGIN: fc.record({ session: sessionArb }),
  SIGN_OUT: fc.constant({}),
  REQUEST_REJECTED: [
    {
      case: "current",
      generate: fc.constant(null),
      resolve: ({ snapshot }: { readonly snapshot: ModelSnapshot }) =>
        snapshot.context.session === null
          ? undefined
          : { accessToken: snapshot.context.session.accessToken },
    },
    {
      case: "stale",
      generate: fc.string({ minLength: 1 }),
      resolve: ({
        snapshot,
        generated,
      }: {
        readonly snapshot: ModelSnapshot;
        readonly generated: unknown;
      }) => ({
        accessToken: `${snapshot.context.session?.accessToken ?? ""}${String(generated)}`,
      }),
    },
  ],
  REFRESH_RESPONDS: {
    generate: fc.record({ response: refreshResponseArb }),
    when: isRefreshing,
  },
};

const toRefreshEffect = (response: RefreshResponse) => {
  if (response.result === "tokens") {
    return Effect.succeed(response.tokens);
  }

  return Effect.fail(
    new SessionRefreshError({
      reason: response.result === "refused" ? "Rejected" : "Failed",
    })
  );
};

const createSession = () => {
  const persistence = makePersistence(KeyValueStore.layerMemory, {
    defaultLocale: () => "en-us",
  });

  const { registry, sessionAtom } = persistence;
  let refreshCalls = 0;

  let pending:
    | Deferred.Deferred<AuthRefreshResponseSchema, SessionRefreshError>
    | undefined;

  const server = SessionRefresh.of({
    refresh: () =>
      Effect.gen(function* () {
        refreshCalls += 1;

        const response = yield* Deferred.make<
          AuthRefreshResponseSchema,
          SessionRefreshError
        >();

        pending = response;

        return yield* Deferred.await(response);
      }),
  });

  // oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests -- @xstate/test drives the SUT through Promises and creates one per run, so each run builds its own runtime and dispose() releases it
  const runtime = ManagedRuntime.make(
    Session.layer(persistence).pipe(
      Layer.provide(Layer.succeed(SessionRefresh, server))
    )
  );

  const read = (): Projection => ({
    session: registry.get(sessionAtom),
    activity: registry.get(sessionActivityAtom),
    refreshCalls,
  });

  const respond = async (response: RefreshResponse) => {
    if (pending === undefined) {
      throw new Error("REFRESH_RESPONDS was sent, but no refresh waits.");
    }

    const waiting = pending;
    pending = undefined;
    await runtime.runPromise(
      Deferred.completeWith(waiting, toRefreshEffect(response))
    );
  };

  const send = async (event: ModelEvent) => {
    const service = await runtime.runPromise(Effect.service(Session));

    switch (event.type) {
      case "LOGIN": {
        await runtime.runPromise(service.start(event.session));
        break;
      }

      case "SIGN_OUT": {
        await runtime.runPromise(service.end);
        break;
      }

      case "REQUEST_REJECTED": {
        runtime.runFork(service.refresh(event.accessToken));
        break;
      }

      case "REFRESH_RESPONDS": {
        await respond(event.response);
        break;
      }

      default: {
        throw new Error(`Unknown event ${JSON.stringify(event)}`);
      }
    }
  };

  const settleFrom = async (
    previous = JSON.stringify(read()),
    stableTurns = 0
  ): Promise<void> => {
    if (stableTurns === 2) {
      return;
    }

    await nextMacrotask();
    const current = JSON.stringify(read());

    await settleFrom(current, current === previous ? stableTurns + 1 : 0);
  };

  const settle = async () => {
    await settleFrom();
  };

  const dispose = async () => {
    await runtime.dispose();
  };

  return { send, read, settle, dispose };
};

const sessionSut: TestSut<ModelSnapshot, ModelEvent> = {
  create: createSession,
  projectModel: (snapshot): Projection => ({
    session: snapshot.context.session,
    activity: snapshot.matches("refreshing") ? "refreshing" : "idle",
    refreshCalls: snapshot.context.refreshCalls,
  }),
};

describe("Session", () => {
  test("should match the Session Model for any order of logins, sign-outs, rejected requests and refresh responses", async () => {
    const { coverage } = await propertyTest(sessionModel, {
      events,
      sut: sessionSut,
    });

    assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 });
  });
});
