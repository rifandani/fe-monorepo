# The Session lifecycle is an XState machine on Effect

> Recorded on 2026-11-20. Builds on [ADR-0006](./0006-core-owns-the-effect-seams.md): the `Session` service keeps its seam, and gets Session Refresh.

The Session lifecycle — Session Start, Session Refresh and End Session — runs as one XState v6 statechart, the Session Machine (`packages/core/src/lib/session/session-machine.ts`). `@xstate/effect` hosts it on the Effect runtime: `Session.layer` starts the actor with `createEffectActor`, so the actor lives as long as the app runtime, and its invoked work runs as Effects with the app's services and tracing.

The machine holds only the work that runs now (`idle`, `refreshing`, `ending`). The Session data stays in `sessionAtom`, so Persistence, React and the route guards read it as before, and no second copy of the Session exists. The machine writes the atom in plain actions. These run before the actor publishes the step, so a caller that awaits the event (`sendAndAwait`) reads the new Session. Effect actions run in a fork after the step, so they do not write the Session.

The library roles stay separate: Effect for services, layers, errors and tracing; Effect Atom for client state and the bridge to React; TanStack Query for server state; TanStack Form for form state; XState for flows whose next step depends on the current step.

## What the machine guarantees

- **Single flight.** A 401 on a request that carried the Access Token sends `ACCESS_REJECTED`. `refreshing` ignores more of them, so one refresh serves every request rejected at the same time. A rejection that arrives after the refresh finished carries a token that is no longer current, and the refresh task returns at once without a request.
- **Login and sign-out win.** `START` and `END` are handled at the root. Leaving `refreshing` interrupts the refresh Effect, so a stale refresh never writes over a new login, and a sign-out never waits for the network.
- **Refused versus failed.** A 401 or 403 on the refresh (`SessionRefreshError` with `reason: "Rejected"`) goes to `ending`. Any other failure goes back to `idle` and keeps the Session: the server did not say that it is invalid.
- **One retry.** `Http` sends the rejected request once more with the new Access Token. A second 401 is the answer.

## The SessionRefresh seam

`Http` needs `Session`, so `Session` cannot need `Http`. `SessionRefresh` is the seam between them. Its live adapter (`auth/session-refresh.ts`) sends `authApi.refresh` on `Http.layerWithoutSession`, which needs only the transport `HttpClient`. Tests give `SessionRefresh.layerRejecting` (a rejected Access Token ends the Session, the behavior before this ADR) or a stub. ADR-0006 rejects a service with one adapter; this one has two, and it removes an import cycle.

## Considered Options

- **Keep the 401 → End Session behavior** — rejected. The refresh token was in every Session and never used, so each expired Access Token signed the person out.
- **A hand-written single-flight refresh (a shared promise or `Effect.cached`)** — rejected. It covers single flight, but interruption by a login or a sign-out, and the refused-versus-failed rule, become flags around it. The statechart states them, and the Stately tools can show them.
- **Machine context as the Session, synced to the atom** — rejected. Two copies of the Session, and observers of the actor and the atom see the change in different orders.
- **Wrap the login form in a machine** — rejected. A login is one request; TanStack Form and Query already model it.
- **`@xstate/store` for client state** — rejected. Effect Atom already does this, and the two have no bridge.
- **`useActor` / `useMachine` from `@xstate/react`** — not used. They start actors with `createActor`, without the Effect host. To show machine state in React, use `createActorAtoms` from `@xstate/effect/atom`, or `useSelector` on the actor.

## Consequences

- `xstate` and `@xstate/effect` are beta (`6.0.0-beta.3`, `1.0.0-beta.2`), pinned exactly. `@xstate/effect` is marked experimental, and `effect/reactivity`, which it builds on, is an unstable Effect module. Upgrades can break; read the vendored source in `repos/xstate` (branch `next`) before an upgrade.
- The `xstate-effect/no-inline-effect` lint rule is on: an inline `enq(() => Effect.log(...))` builds an Effect that never runs.
- The Session Machine has no persisted snapshot. After a restart it starts in `idle`, and the Session comes from `sessionAtom`.
