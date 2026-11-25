import { setImmediate as nextMacrotask } from "node:timers/promises";

import { fc } from "@fast-check/vitest";
import { sessionArb } from "@test/arbitraries";
import { authLoginResponseSchema } from "@workspace/core/auth/schemas";
import type {
  AuthLoginResponseSchema,
  AuthRefreshResponseSchema,
} from "@workspace/core/auth/schemas";
import {
  makePersistence,
  persistenceKeys,
} from "@workspace/core/persistence/persistence";
import { Session, sessionActivityAtom } from "@workspace/core/session/session";
import { makeMemorySessionLock } from "@workspace/core/session/session-lock";
import type { SessionLock } from "@workspace/core/session/session-lock";
import type { SessionActivity } from "@workspace/core/session/session-machine";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { assertTestCoverage, propertyTest } from "@xstate/test";
import type { TestSut } from "@xstate/test";
import { Deferred, Effect, Layer, ManagedRuntime, Schema } from "effect";
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

const settleFrom = async (
  read: () => object,
  previous: string,
  stableTurns: number
): Promise<void> => {
  if (stableTurns === 2) {
    return;
  }

  await nextMacrotask();
  const current = JSON.stringify(read());

  await settleFrom(read, current, current === previous ? stableTurns + 1 : 0);
};

const settleProjection = async (read: () => object) => {
  await settleFrom(read, JSON.stringify(read()), 0);
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

  const refreshStub = SessionRefresh.of({
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
      Layer.provide(Layer.succeed(SessionRefresh, refreshStub))
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

  const settle = async () => {
    await settleProjection(read);
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

type Tab = "a" | "b";

const tabs: readonly Tab[] = ["a", "b"];

interface Rejection {
  readonly tab: Tab;
  readonly token: string;
}

interface TabsContext {
  readonly stored: AuthLoginResponseSchema | null;
  readonly views: Readonly<Record<Tab, AuthLoginResponseSchema | null>>;
  readonly holder: Rejection | null;
  readonly waiter: Rejection | null;
  readonly refreshCalls: number;
  readonly ends: Readonly<Record<Tab, number>>;
}

interface TabsProjection {
  readonly stored: AuthLoginResponseSchema | null;
  readonly views: Readonly<Record<Tab, AuthLoginResponseSchema | null>>;
  readonly activity: Readonly<Record<Tab, SessionActivity>>;
  readonly refreshCalls: number;
  readonly inFlight: number;
  readonly ends: Readonly<Record<Tab, number>>;
}

const withView = (
  context: TabsContext,
  tab: Tab,
  view: AuthLoginResponseSchema | null
): TabsContext => ({ ...context, views: { ...context.views, [tab]: view } });

const endIn = (context: TabsContext, tab: Tab): TabsContext => ({
  ...withView({ ...context, stored: null }, tab, null),
  ends: { ...context.ends, [tab]: context.ends[tab] + 1 },
});

const acquireLock = (
  context: TabsContext,
  rejection: Rejection
): TabsContext => {
  const reread = withView(context, rejection.tab, context.stored);

  if (context.stored === null) {
    return endIn(context, rejection.tab);
  }

  if (context.stored.accessToken !== rejection.token) {
    return reread;
  }

  return {
    ...reread,
    holder: rejection,
    refreshCalls: context.refreshCalls + 1,
  };
};

const releaseLock = (context: TabsContext): TabsContext => {
  const released = { ...context, holder: null, waiter: null };

  return context.waiter === null
    ? released
    : acquireLock(released, context.waiter);
};

const leaveRefresh = (context: TabsContext, tab: Tab): TabsContext => {
  if (context.holder?.tab === tab) {
    return releaseLock(context);
  }

  return context.waiter?.tab === tab ? { ...context, waiter: null } : context;
};

const applyResponse = (
  context: TabsContext,
  { tab, token }: Rejection,
  response: RefreshResponse
): TabsContext => {
  const { stored } = context;

  if (stored === null) {
    return endIn(context, tab);
  }

  if (stored.accessToken !== token) {
    return withView(context, tab, stored);
  }

  if (response.result === "refused") {
    return endIn(context, tab);
  }

  if (response.result === "failed") {
    return withView(context, tab, stored);
  }

  const refreshed = { ...stored, ...response.tokens };

  return withView({ ...context, stored: refreshed }, tab, refreshed);
};

const isBusy = (context: TabsContext, tab: Tab) =>
  context.holder?.tab === tab || context.waiter?.tab === tab;

const writeSession = (
  context: TabsContext,
  tab: Tab,
  session: AuthLoginResponseSchema | null
): TabsContext =>
  withView({ ...leaveRefresh(context, tab), stored: session }, tab, session);

const ada: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

const tabsModel = createMachine({
  id: "tabsModel",
  schemas: {
    context: types<TabsContext>(),
    events: {
      LOGIN: types<{
        readonly tab: Tab;
        readonly session: AuthLoginResponseSchema;
      }>(),
      SIGN_OUT: types<{ readonly tab: Tab }>(),
      RELOAD: types<{ readonly tab: Tab }>(),
      REQUEST_REJECTED: types<Rejection>(),
      REFRESH_RESPONDS: types<{ readonly response: RefreshResponse }>(),
    },
  },
  context: {
    stored: ada,
    views: { a: ada, b: ada },
    holder: null,
    waiter: null,
    refreshCalls: 0,
    ends: { a: 0, b: 0 },
  },
  on: {
    LOGIN: ({ context, event }) => ({
      context: writeSession(context, event.tab, event.session),
    }),
    SIGN_OUT: ({ context, event }) => ({
      context: endIn(leaveRefresh(context, event.tab), event.tab),
    }),
    RELOAD: ({ context, event }) =>
      isBusy(context, event.tab)
        ? undefined
        : { context: withView(context, event.tab, context.stored) },
    REQUEST_REJECTED: ({ context, event }) =>
      isBusy(context, event.tab) ||
      context.views[event.tab]?.accessToken !== event.token
        ? undefined
        : {
            context:
              context.holder === null
                ? acquireLock(context, { tab: event.tab, token: event.token })
                : {
                    ...context,
                    waiter: { tab: event.tab, token: event.token },
                  },
          },
    REFRESH_RESPONDS: ({ context, event }) =>
      context.holder === null
        ? undefined
        : {
            context: releaseLock(
              applyResponse(context, context.holder, event.response)
            ),
          },
  },
});

type TabsSnapshot = SnapshotFrom<typeof tabsModel>;

type TabsEvent = EventFrom<typeof tabsModel>;

interface TabsArgs {
  readonly snapshot: TabsSnapshot;
  readonly generated: unknown;
}

const releasesToWaiter = (snapshot: TabsSnapshot, tab: Tab) =>
  snapshot.context.holder?.tab === tab && snapshot.context.waiter !== null;

const tabEvents = (tab: Tab) => ({
  login: {
    case: tab,
    generate: fc.record({ tab: fc.constant(tab), session: sessionArb }),
    when: ({ snapshot }: { readonly snapshot: TabsSnapshot }) =>
      !releasesToWaiter(snapshot, tab),
  },
  signOut: {
    case: tab,
    generate: fc.constant({ tab }),
    when: ({ snapshot }: { readonly snapshot: TabsSnapshot }) =>
      !releasesToWaiter(snapshot, tab),
  },
  reload: {
    case: tab,
    weight: 2,
    generate: fc.constant({ tab }),
    when: ({ snapshot }: { readonly snapshot: TabsSnapshot }) =>
      !isBusy(snapshot.context, tab),
  },
  rejected: [
    {
      case: `${tab}-current`,
      weight: 3,
      generate: fc.constant(null),
      resolve: ({ snapshot }: TabsArgs) => {
        const view = snapshot.context.views[tab];

        return view === null ? undefined : { tab, token: view.accessToken };
      },
    },
    {
      case: `${tab}-stale`,
      generate: fc.string({ minLength: 1 }),
      resolve: ({ snapshot, generated }: TabsArgs) => ({
        tab,
        token: `${snapshot.context.views[tab]?.accessToken ?? ""}${String(generated)}`,
      }),
    },
  ],
});

const tabA = tabEvents("a");

const tabB = tabEvents("b");

const tabsEventSpec = {
  LOGIN: [tabA.login, tabB.login],
  SIGN_OUT: [tabA.signOut, tabB.signOut],
  RELOAD: [tabA.reload, tabB.reload],
  REQUEST_REJECTED: [...tabA.rejected, ...tabB.rejected],
  REFRESH_RESPONDS: {
    generate: fc.record({ response: refreshResponseArb }),
    when: ({ snapshot }: { readonly snapshot: TabsSnapshot }) =>
      snapshot.context.holder !== null,
  },
};

const decodeStored = Schema.decodeUnknownSync(
  Schema.fromJsonString(Schema.NullOr(authLoginResponseSchema))
);

const encodeStored = Schema.encodeSync(
  Schema.fromJsonString(authLoginResponseSchema)
);

const makeSharedStore = (session: AuthLoginResponseSchema) => {
  const entries = new Map<string, string>([
    [persistenceKeys.session, encodeStored(session)],
  ]);

  const store = KeyValueStore.makeStringOnly({
    get: (key) => Effect.sync(() => entries.get(key)),
    set: (key, value) =>
      Effect.sync(() => {
        entries.set(key, value);
      }),
    remove: (key) =>
      Effect.sync(() => {
        entries.delete(key);
      }),
    clear: Effect.sync(() => {
      entries.clear();
    }),
    size: Effect.sync(() => entries.size),
    keys: Effect.sync(() => [...entries.keys()]),
  });

  const stored = () => {
    const raw = entries.get(persistenceKeys.session);

    return raw === undefined ? null : decodeStored(raw);
  };

  return {
    layer: Layer.succeed(KeyValueStore.KeyValueStore, store),
    stored,
  };
};

const createTabs = () => {
  const shared = makeSharedStore(ada);
  const lock: SessionLock = makeMemorySessionLock();
  let refreshCalls = 0;
  const ends = { a: 0, b: 0 };

  const pending = new Map<
    Tab,
    Deferred.Deferred<AuthRefreshResponseSchema, SessionRefreshError>
  >();

  const openTab = (tab: Tab) => {
    const persistence = makePersistence(shared.layer, {
      defaultLocale: () => "en-us",
    });

    const refreshStub = SessionRefresh.of({
      refresh: () =>
        Effect.gen(function* () {
          refreshCalls += 1;

          const response = yield* Deferred.make<
            AuthRefreshResponseSchema,
            SessionRefreshError
          >();

          pending.set(tab, response);

          return yield* Deferred.await(response);
        }).pipe(
          Effect.ensuring(
            Effect.sync(() => {
              pending.delete(tab);
            })
          )
        ),
    });

    // oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests -- @xstate/test drives the SUT through Promises and creates one per run, so each tab of each run builds its own runtime and dispose() releases it
    const runtime = ManagedRuntime.make(
      Session.layer(persistence, {
        lock,
        onEnd: Effect.sync(() => {
          ends[tab] += 1;
        }),
      }).pipe(Layer.provide(Layer.succeed(SessionRefresh, refreshStub)))
    );

    return { persistence, runtime };
  };

  const opened = { a: openTab("a"), b: openTab("b") };

  const reload = async (tab: Tab) => {
    await opened[tab].runtime.dispose();
    opened[tab] = openTab(tab);
  };

  const viewOf = (tab: Tab) =>
    opened[tab].persistence.registry.get(opened[tab].persistence.sessionAtom);

  const activityOf = (tab: Tab) =>
    opened[tab].persistence.registry.get(sessionActivityAtom);

  const read = (): TabsProjection => ({
    stored: shared.stored(),
    views: { a: viewOf("a"), b: viewOf("b") },
    activity: { a: activityOf("a"), b: activityOf("b") },
    refreshCalls,
    inFlight: pending.size,
    ends: { ...ends },
  });

  const respond = async (response: RefreshResponse) => {
    const [waiting, ...others] = pending.values();

    if (waiting === undefined || others.length > 0) {
      throw new Error(
        `REFRESH_RESPONDS needs one refresh in flight, but ${pending.size} are.`
      );
    }

    await opened.a.runtime.runPromise(
      Deferred.completeWith(waiting, toRefreshEffect(response))
    );
  };

  const send = async (event: TabsEvent) => {
    if (event.type === "REFRESH_RESPONDS") {
      await respond(event.response);

      return;
    }

    if (event.type === "RELOAD") {
      await reload(event.tab);

      return;
    }

    const { runtime } = opened[event.tab];
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
        runtime.runFork(service.refresh(event.token));
        break;
      }

      default: {
        throw new Error(`Unknown event ${JSON.stringify(event)}`);
      }
    }
  };

  const settle = async () => {
    await settleProjection(read);
  };

  const dispose = async () => {
    await Promise.all(
      tabs.map(async (tab) => {
        await opened[tab].runtime.dispose();
      })
    );
  };

  return { send, read, settle, dispose };
};

const activityIn = (context: TabsContext, tab: Tab): SessionActivity =>
  isBusy(context, tab) ? "refreshing" : "idle";

const tabsSut: TestSut<TabsSnapshot, TabsEvent> = {
  create: createTabs,
  projectModel: ({ context }): TabsProjection => ({
    stored: context.stored,
    views: context.views,
    activity: { a: activityIn(context, "a"), b: activityIn(context, "b") },
    refreshCalls: context.refreshCalls,
    inFlight: context.holder === null ? 0 : 1,
    ends: context.ends,
  }),
};

describe("Session across tabs", () => {
  test("should send one refresh at a time, and never with a refresh token that another tab already used, for any order of events in two tabs on one store", async () => {
    const { coverage } = await propertyTest(tabsModel, {
      events: tabsEventSpec,
      sut: tabsSut,
    });

    assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 });
  });
});
