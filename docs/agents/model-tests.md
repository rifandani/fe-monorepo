# Model Tests

How to write a Model Test with `@xstate/test`. The decisions and the vocabulary (Model Test, Model, SUT Adapter, Projection) are in [ADR-0011](../adr/0011-model-tests-use-xstate-test.md). Read the vendored source in `repos/xstate/packages/xstate-test` (README and `test/`) for the API.

Examples:

- Unit suite: `packages/core/src/lib/session/session.model.unit.test.ts`
- Route Tests: `apps/spa/e2e/session.model.e2e.test.tsx`

## When to write one

Write a Model Test for a flow whose result depends on the order of events: a statechart (ADR-0010), a service with a request in flight, a page with more than one way to reach a state. Do not write one for a pure function; a Property Test (ADR-0009) is simpler.

## Steps

1. **Name the events from the outside.** Use what a person or a server does (`LOGIN`, `REQUEST_REJECTED`, `REFRESH_RESPONDS`), not the internal events of the code (`xstate.done.actor`). An answer from a server is its own event, so the order of answers and requests is an input.
2. **Write the Model in the test file.** Use `createMachine` from `xstate`, with `types<…>()` for context and event payloads. Keep it in `pure` mode, with no invokes and no delays. Do not import the machine under test as the Model.
   - In the unit suite, put the expected values in context, and use transition functions.
   - In Route Tests, use payload-free events and object transitions with literal targets, so the graph is static and finite.
3. **Write the SUT Adapter.** `create()` builds a new system for each run: new Persistence, new layers, new stubs. `send(event)` performs the event. `dispose()` releases everything, and finishes any request that the stubs still hold.
   - Hold a server answer in a `Deferred` (unit suite) or in a `Promise.withResolvers()` inside an MSW handler (Route Tests), and complete it when the Model sends the answer event.
   - Start a request that must overlap other events in a new fiber (`runtime.runFork`), and do not wait for it.
4. **Choose the oracle.**
   - Unit suite: `sut.projectModel(snapshot)` and `session.read()` return the same Projection. `session.settle()` waits until two macrotask turns in a row show the same Projection.
   - Route Tests: `states` assertions keyed by leaf state value (`"signedIn.refreshing"`), with `expect.element` and `expect.poll`. Do not use `read()` with a fixed wait.
5. **Choose the generator for each event.**
   - `propertyTest()` sends only the events in `events`. Use a fast-check arbitrary for the payload, `when` to offer an event only in some states, and `resolve` for a payload that depends on the Model state (for example the current token).
   - `testPaths()` offers every payload-free event that the Model handles.
6. **Run the campaign in a plain `test`, then check coverage:**

   ```ts
   const { coverage } = await propertyTest(model, { events, sut });

   assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 });
   ```

   In Route Tests, call `testPaths(model, { pathGenerator: "edges", sut, states })`.
7. **Check that the test can fail.** Break the code one rule at a time (a wrong target, a missing guard, a removed UI element). Run the test, and see a failure with a short counterexample. Then restore the code.

## Rules

- Unit suite: file name `*.model.unit.test.ts`. Use `propertyTest()`. Do not set `seed` or `numRuns`; ADR-0009 sets them globally, and `FC_SEED` from the Replay Line replays a failure.
- Route Tests: file name `*.model.e2e.test.tsx`. Use `testPaths()` with `pathGenerator: "edges"`. Do not use `propertyTest()`.
- Do not use `withModelTests` / `it.model`; they do not give back the coverage.
- Do not set `failures`, and do not commit `.xstate-test/`.
- Do not use `vi.fn()` or `vi.spyOn()` stubs in the SUT Adapter. Use a real service with a stub layer, or an MSW handler.
- A unit SUT Adapter needs a runtime for each run. Use `ManagedRuntime.make(...)` with the `oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests` reason of the core example, and dispose it in `dispose()`.
