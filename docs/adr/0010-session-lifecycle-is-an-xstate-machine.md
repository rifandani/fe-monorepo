# The Session lifecycle is an XState machine on Effect

> Recorded on 2026-11-20. Builds on [ADR-0006](./0006-core-owns-the-effect-seams.md): the `Session` service keeps its seam, and gets Session Refresh.

> On 2026-11-26, the section "When boolean flags become a machine" was added (#224). It gives the decision rule between an XState machine and boolean flags, and the `state/no-boolean-flag-cluster` lint rule that finds possible cases.

The Session lifecycle — Session Start, Session Refresh and End Session — runs as one XState v6 statechart, the Session Machine (`packages/core/src/lib/session/session-machine.ts`). `@xstate/effect` hosts it on the Effect runtime: `Session.layer` starts the actor with `createEffectActor`, so the actor lives as long as the app runtime, and its invoked work runs as Effects with the app's services and tracing.

The machine holds only the work that runs now (`idle`, `starting`, `refreshing`, `ending`). The Session data stays in `sessionAtom`, so Persistence, React and the route guards read it as before, and no second copy of the Session exists. Each state other than `idle` invokes its work as an Effect task, and that task is the only code that writes `sessionAtom` in that state. A `Session` method sends its event and waits for `idle`; from then on, the atom holds the result.

`sessionMachine` is a static definition. Every transition is an object with a literal target, so `toDirectedGraph` reports `transitionTargetsComplete: true` and `machineToJSON` exports the whole graph, and a test keeps both true. The work of each state needs the app's Persistence, so the definition holds typed stand-ins, and `provideSessionMachine` replaces them with `machine.provide({ actors })`. Visual tools for v6 (Stately Studio, the VS Code extension) are still in progress upstream; until they ship, the JSON export is the way to view the graph.

`Session.layer` publishes the machine state to `sessionActivityAtom`, so React reads it with `useAtomValue`. The profile menu of the SPA shows a spinner while a token refresh runs.

The library roles stay separate: Effect for services, layers, errors and tracing; Effect Atom for client state and the bridge to React; TanStack Query for server state; TanStack Form for form state; XState for flows whose next step depends on the current step.

## When boolean flags become a machine

Some modules keep the state of a flow in separate boolean flags (for example `open`, `loading` and `done`). Nobody can list the transitions between these flags. Some combinations of the flags have no meaning.

Use this decision rule:

- **The next step depends on the current step**: use an XState machine. The machine names each step, and its graph lists each transition. For example, a step can start only from one step, or a new event stops the work of the current step.
- **The next step does not depend on the current step**: keep the flags, because each flag changes independently. List their transitions in one pure function, and write unit tests for it. The function takes the flags (and the event, if there is one). It returns the next flags or the result. For example, `resolveSwPrompt` (`apps/spa/src/utils/sw.ts`) takes the `needRefresh` and `offlineReady` flags of the service worker and returns the prompt to show. `sw.unit.test.ts` tests all four combinations.

The `state/no-boolean-flag-cluster` lint rule (`tools/lint/state.ts`, warn) finds possible cases:

- a function (a component or a hook) with 3 or more boolean `useState` values from `react`. A value is boolean if it has the type argument `boolean`, or the initial value `true`, `false` or `!x`.
- a module with 3 or more boolean `let` values at module level. A value is boolean if it has the type `boolean`, or the initial value `true`, `false` or `!x`.

The rule does not use type information. It does not find `useState(isOpen)`, `boolean | undefined`, `useReducer`, or flags in objects and refs.

If the flags change independently, keep them. Put the pure function and its tests in place. Then add `// oxlint-disable-next-line state/no-boolean-flag-cluster -- <reason>` above the first flag that the rule reports.

## What the machine guarantees

- **Single flight.** A 401 on a request that carried the Access Token sends `ACCESS_REJECTED`. Only `idle` takes it, so one refresh serves every request rejected at the same time. A rejection that arrives after the refresh finished carries a token that is no longer current, and the refresh task returns at once without a request.
- **Login and sign-out win.** `START` and `END` are handled at the root. Leaving `refreshing` interrupts the refresh Effect, so a stale refresh never writes over a new login, and a sign-out never waits for the network.
- **Refused versus failed.** The refresh task fails only on a 401 or 403 (`SessionRefreshError` with `reason: "Rejected"`), and its `onError` goes to `ending`. It treats any other failure as done without new tokens, so the Session stays: the server did not say that it is invalid.
- **One retry.** `Http` sends the rejected request once more with the new Access Token. A second 401 is the answer.

## Cross-tab

The tabs of one browser share one `localStorage`, so they share one Session, but each tab has its own Session Machine and its own `sessionAtom`. Single flight in one tab does not stop two tabs: when the Access Token expires, both tabs can send `auth/refresh` with the same refresh token. If the server rotates refresh tokens, it refuses the second request, that tab goes to `ending`, and End Session signs out both tabs.

- **One Session Lock around the request.** The refresh task runs its request inside a Session Lock (`session-lock.ts`). The SPA gives `makeWebSessionLock("app-session-refresh")`, which holds `navigator.locks.request` for the time of the work. Other Sessions use the default `makeMemorySessionLock()`; expo has one app instance, so it needs no more. A tab whose own `sessionAtom` already holds a different Access Token returns at once, without the lock.
- **Read the store again under the lock.** `sessionAtom` reads the store once and then keeps its value, so another tab's write is not visible to it. `Persistence.reloadSession` reads the stored Session again and writes it to `sessionAtom`. A tab that gets the lock calls it before it sends a request. If the stored Access Token is not the rejected one, another tab finished a refresh or a login. The tab keeps that Session and sends no request. If the store has no Session, another tab ended it. The tab then fails into `ending`, so End Session runs `onEnd` in this tab too (the SPA clears its query cache). If the read fails, the tab sends no request and the Session stays, as for a refresh that cannot finish.
- **Read the store again before the write.** When the response arrives, the task reads the store again. It writes the new tokens, or discards the Session for a refusal, only if the store still holds the rejected Access Token. Otherwise a login in another tab came during the request, and it wins: the tab keeps the stored Session. A sign-out in another tab gives an empty store, and End Session runs as above.
- **Write before the lock is released.** On a refusal, the task discards the Session inside the lock, then fails into `ending`. So the next tab that gets the lock reads no Session, and does not send the refused refresh token again.
- **Interruption releases the lock.** A login or a sign-out in the same tab interrupts the refresh. A waiting tab leaves the queue; a tab that holds the lock aborts its work, and the lock goes to the next tab.
- **No storage events.** A tab does not follow `storage` events. It sees a Session that another tab wrote when it reloads, or when its own request is rejected. This keeps one writer per tab for `sessionAtom`.

The Model Test "Session across tabs" in `session.model.unit.test.ts` runs two Sessions on one shared memory store and one memory Session Lock (ADR-0011). Its Projection includes the number of `onEnd` calls in each tab. Its Model does not let a tab log in or sign out while it holds the lock and the other tab waits. In that order, the waiting tab can read the store before or after the login. Both results are correct, but the Model can give only one expected Projection.

Known limits:

- `reloadSession` writes the value that it read back to the store, because `Atom.kvs` has no setter for the atom only. The read and the write run in one task, and `localStorage` gives a tab the writes of other tabs between tasks.
- Between a refusal and the write of `ending`, a login in another tab can occur. `ending` then discards that new Session. The time between the two is a few microtasks.

## The SessionRefresh seam

`Http` needs `Session`, so `Session` cannot need `Http`. `SessionRefresh` is the seam between them. Its live adapter (`auth/session-refresh.ts`) sends `authApi.refresh` on `Http.layerWithoutSession`, which needs only the transport `HttpClient`. Tests give `SessionRefresh.layerRejecting` (a rejected Access Token ends the Session, the behavior before this ADR) or a stub. ADR-0006 rejects a service with one adapter; this one has two, and it removes an import cycle.

## Considered Options

- **Keep the 401 → End Session behavior** — rejected. The refresh token was in every Session and never used, so each expired Access Token signed the person out.
- **One leader tab that refreshes for all tabs (with `BroadcastChannel`)** — rejected. It needs leader election and a hand-over when the leader tab closes. A lock that each tab takes for its own refresh gives the same single flight with less state.
- **Follow `storage` events into `sessionAtom`** — rejected for this fix. It makes a second writer of `sessionAtom` in each tab, and it does not stop two requests that start at the same time.
- **A hand-written single-flight refresh (a shared promise or `Effect.cached`)** — rejected. It covers single flight, but interruption by a login or a sign-out, and the refused-versus-failed rule, become flags around it. The statechart states them, and the Stately tools can show them.
- **Machine context as the Session, synced to the atom** — rejected. Two copies of the Session, and observers of the actor and the atom see the change in different orders.
- **Write `sessionAtom` in named actions, with transition functions** — replaced. It worked, but a transition function hides its targets from graph tools, so three edges were invisible.
- **`createActorAtoms` from `@xstate/effect/atom` for React** — rejected. It starts its own actor in an atom. The Session must have one actor, which `Http` and React share, and moving it into the atom registry would take the refresh request out of the app runtime (its tracer and transport settings).
- **Wrap the login form in a machine** — rejected. A login is one request; TanStack Form and Query already model it.
- **`@xstate/store` for client state** — rejected. Effect Atom already does this, and the two have no bridge.
- **`useActor` / `useMachine` from `@xstate/react`** — not used. They start actors with `createActor`, without the Effect host.

## Consequences

- `xstate` and `@xstate/effect` are beta (`6.0.0-beta.5`, `1.0.0-beta.3` since 2026-11-24, for `@xstate/test`; see [ADR-0011](./0011-model-tests-use-xstate-test.md)), pinned exactly. `@xstate/effect` is marked experimental, and `effect/reactivity`, which it builds on, is an unstable Effect module. Upgrades can break; read the vendored source in `repos/xstate` (branch `next`) before an upgrade.
- The `xstate-effect/no-inline-effect` lint rule is on: an inline `enq(() => Effect.log(...))` builds an Effect that never runs.
- The Session Machine has no persisted snapshot. After a restart it starts in `idle`, and the Session comes from `sessionAtom`.
