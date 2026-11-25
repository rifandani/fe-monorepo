# Model Tests

A Model Test runs a small expected-state machine (the **Model**) and the real code side by side with the same events, and compares them after each step. [ADR-0011](../adr/0011-model-tests-use-xstate-test.md) defines the vocabulary (Model, SUT Adapter, Projection); the vendored source in `repos/xstate/packages/xstate-test` (README and `test/`) defines the API.

Examples: `packages/core/src/lib/session/session.model.unit.test.ts` (one Session, and two tabs on one store) and `apps/spa/e2e/session.model.e2e.test.tsx`.

## When to write one

Write one when the result depends on event order: a statechart (ADR-0010), a request in flight, a page reachable in several ways. For a pure function, use a Property Test (ADR-0009).

## The two flavors

| | Unit suite | Route Tests |
|---|---|---|
| File | `*.model.unit.test.ts` | `*.model.e2e.test.tsx` |
| Runner | `propertyTest()` | `testPaths()` with `pathGenerator: "edges"` |
| Events | fast-check arbitraries for payloads | payload-free, literal targets |
| Oracle | `projectModel(snapshot)` equals `read()` | `states` keyed by leaf value |

## How to write one

1. **Name events from the outside.** Use what a person or a server does (`LOGIN`, `REQUEST_REJECTED`, `REFRESH_RESPONDS`), not internal events (`xstate.done.actor`). A server answer is its own event, so the order of answers and requests is an input.
2. **Keep the Model in the test file.** Use `createMachine` with `types<…>()`, in `pure` mode, with no invokes or delays. Never import the machine under test as the Model. In the unit suite, keep expected values in context and use transition functions. In Route Tests, use payload-free events and literal targets so the graph stays static and finite.
3. **Write the SUT Adapter.** `create()` builds a fresh system per run (new Persistence, layers, stubs); `send(event)` performs the event; `dispose()` releases everything. Hold a pending server answer in a `Deferred` (unit) or in `Promise.withResolvers()` inside an MSW handler (Route), and complete it when the Model sends the answer event. Start an overlapping request in a new fiber (`runtime.runFork`) and do not wait for it. In Route Tests, also finish requests MSW still holds and call `resetApp()` from `e2e/support/`.
4. **Choose the oracle.**
   - Unit: `sut.projectModel(snapshot)` and `session.read()` must give the same Projection; `session.settle()` waits for two macrotask turns in a row with the same Projection.
   - Route: assert `states` by leaf value (`"signedIn.refreshing"`) with `expect.element` and `expect.poll`; no fixed wait.
   - If two transitions reach the same state but must leave different data, add `check()` to the SUT session.
5. **Choose the generator.** `propertyTest()` sends only events in `events`: use an arbitrary for the payload, `when` to offer an event in some states, and `resolve` for a payload that depends on Model state (for example, the current token). `testPaths()` offers every payload-free event the Model handles.
6. **Run in a plain `test`, then check coverage:**

   ```ts
   const { coverage } = await propertyTest(model, { events, sut });
   assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 });
   ```

   In Route Tests, call `testPaths(model, { pathGenerator: "edges", sut, states })`.
7. **Check that the test can fail.** Break one rule at a time (wrong target, missing guard, removed UI element), run the test, confirm the short counterexample, then restore the code.

## Rules

- Do not use `withModelTests` / `it.model`: they do not return coverage. Do not set `failures`; do not commit `.xstate-test/`.
- Unit: do not set `seed` or `numRuns` — ADR-0009 sets them globally and `FC_SEED` replays a failure.
- Do not use `vi.fn()` / `vi.spyOn()` stubs in the Adapter: use a real service with a stub layer or an MSW handler.
- A unit Adapter needs a runtime per run: `ManagedRuntime.make(...)` with the `oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests` reason from the core example; dispose it in `dispose()`.
