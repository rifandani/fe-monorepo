# Model Tests use @xstate/test

> Recorded on 2026-11-24. Builds on [ADR-0009](./0009-property-tests-use-fast-check.md) (fast-check, seeds, Replay Line) and [ADR-0010](./0010-session-lifecycle-is-an-xstate-machine.md) (the Session Machine). Revises neither; ADR-0008 and ADR-0009 each have a note that points here.

A flow whose next step depends on the current step (ADR-0010) has bugs that occur only in some orders of events: a login while a refresh runs, a rejected request with a token that is no longer current. Example Tests find the orders that a person thinks of. A **Model Test** writes the expected behavior once, as a small XState machine, and lets `@xstate/test` send many orders of events to the Model and to the real code, and compare them after each step. We use it for the Session lifecycle in two suites: the `core` unit suite, and the spa Route Tests.

## Vocabulary

**Model Test**: A test that runs a Model and the real code side by side with the same events, and compares them after each step. In code it is `propertyTest(model, …)` or `testPaths(model, …)` from `@xstate/test`. _Avoid_: MBT, state machine test, statechart test

**Model**: An XState machine, written in the test file, that is the spec of the expected behavior. It is never the machine under test: a Model that is the code agrees with the code. _Avoid_: test model, oracle machine

**SUT Adapter**: The `sut` object of a Model Test. It turns each Model event into calls on the real code, and reads back what the code shows. _Avoid_: driver, harness, bridge

**Projection**: The plain value that both sides reduce to for the comparison: `projectModel(snapshot)` for the Model, `read()` for the real code. _Avoid_: observation, view

## Decisions

- **The Model is a separate spec.** `session.model.unit.test.ts` does not test `sessionMachine` against itself. Its Model has context for the expected Session and the number of refresh requests, and the SUT is the real `Session` service on memory Persistence. This is how the test can find a bug in the Session Machine.
- **Model events are the person and the server.** `LOGIN`, `SIGN_OUT`, `REQUEST_REJECTED` (with the current or a stale token) and `REFRESH_RESPONDS` (new tokens, refused, failed). The `SessionRefresh` stub holds each refresh in a `Deferred` until the Model sends its response, and a rejected request runs in a new fiber that the test does not wait for. So the order of a response, a second rejection, a login and a sign-out is an input that fast-check chooses and shrinks.
- **The Model context is small.** It holds the expected Session and the number of refresh requests. The current Access Token is the token of that Session, and "a refresh runs" is the `refreshing` state, so neither needs its own field.
- **The Model runs in `pure` mode, with no invokes.** All timing is in explicit events. `executed` mode, `outcomes` and `commands` are not used.
- **Unit suite: `propertyTest()`.** It runs random sequences, which find ordering bugs better than shortest paths. `propertyTest()` calls `fc.check`, so the global settings of ADR-0009 apply with no bridge: `FC_SEED`, `FC_NUM_RUNS`, the Stryker seed and budget, and the Replay Line on a failure.
- **Route Tests: `testPaths()` with `pathGenerator: "edges"`.** The UI Model is a small static graph. `edges` plans one run per enabled event from each reachable state, so every transition is taken, and the number of browser runs is fixed (11 today). It is not a Property Test, so the ADR-0009 rejection of Property Tests in Route Tests stays true. `shortest` was the first choice. It plans one path per state. On this graph, its 2 runs do not take 4 of the 7 transitions (`SIGN_OUT` and the three refresh responses), so the coverage gate fails.
- **Coverage gate.** Each Model Test calls `assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 })` after the campaign. A Model transition that no run takes fails the test.
- **Plain `test`, not `it.model`.** `withModelTests` from `@xstate/test/vitest` does not give back the coverage, so the gate cannot run. The test calls `propertyTest()` or `testPaths()` in a plain Vitest `test`.
- **No saved fixtures.** `failures` stays off (the default of `propertyTest()`). A failure is replayed with the Replay Line, and a bug that the current task does not fix is recorded as `it.fails` on its minimal example (ADR-0009).
- **Placement.** The Model and the SUT Adapter are in the test file: `*.model.unit.test.ts` in the unit suite, `*.model.e2e.test.tsx` in the Route Tests. Coverage, Stryker and fallow see no new production file. Locators that more than one Route Test uses go in `apps/spa/e2e/support/`.
- **One runtime per run.** `@xstate/test` creates the SUT through Promises, once per run. The unit SUT Adapter builds a `ManagedRuntime` for each run and disposes it at the end, with an `oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests` that gives this reason.
- **Settle.** The unit SUT Adapter settles when two macrotask turns in a row show the same Projection. The Route Test SUT Adapter does not compare a Projection. It uses `states` assertions with `expect.element` and `expect.poll`, which retry until the page shows the state. A fixed wait would be flaky.
- **The UI Model has no invalid-input login.** Field validation is form behavior that does not touch the Session, and `login.e2e.test.tsx` already tests it. The UI Model has `LOGIN_VALID` and `LOGIN_WRONG` (the server refuses the credentials).
- **The Route Test checks the Access Token.** `REFRESH_SUCCEEDS` and `REFRESH_FAILS` both go to `signedIn.idle`. The SUT Adapter keeps the last Access Token that the MSW server gave, and its `check()` makes sure that the Session holds it after each step. So a refresh that does not keep the new tokens fails.
- **The SPA has no screen that sends a request with the Access Token.** The Route Test SUT Adapter sends `REQUEST_REJECTED` through `appRuntime` with the app's `Http`, to an MSW handler that answers 401 to a rejected token. The refresh then goes through the real `Http`, `SessionRefresh`, Session Machine and profile menu. MSW holds `auth/refresh` until the Model sends the response.

## Two tabs

> Added on 2026-11-25 for the cross-tab Session Refresh (ADR-0010, "Cross-tab").

The same file has a second Model Test, "Session across tabs". Its SUT Adapter builds two `Session` services on one shared memory store and one memory Session Lock. Its Model context is larger than the rule above: the stored Session, the Session that each tab shows, the tab that holds the lock, the tab that waits, the number of refresh requests, and the number of `onEnd` calls in each tab. It adds the event `RELOAD` (a tab loads the page again and reads the store). `LOGIN`, `SIGN_OUT` and `REQUEST_REJECTED` name a tab. Both tabs start with one stored Session, so each run can reach two refreshes at the same time.

## Considered Options

- **The Session Machine as its own Model** — rejected. The SUT runs the same machine, so the test agrees with itself. It checks only the wiring of `Session.layer`.
- **Invariants and temporal properties on the real machine, with no Projection** — rejected as the main oracle. They state general rules ("`ending` always gets to `idle`"), not the expected Session after each step.
- **`createPlaywrightSut` from `@xstate/test/playwright`** — rejected. It needs a Playwright `Page` (`route`, `clock`, `waitForLoadState`). A Route Test runs inside Chromium, and has only `page` from `vitest/browser`. A second browser runner would go against ADR-0008.
- **`propertyTest()` in Route Tests** — rejected for the reason in ADR-0009: each run mounts the whole app.
- **Saved `.xstate-test/` fixtures** — rejected. A second failure format beside the Replay Line, and the fixture key is the test name, which changes.
- **The standalone `createTestModel()` of `@xstate/test/paths`** — not used. It is experimental, and an XState machine gives graph tools and coverage.

## Consequences

- `@xstate/test` is `2.0.0-beta.3`, pinned exactly in the root `devDependencies`. It needs `xstate ≥ 6.0.0-beta.5`, so `xstate` moved to `6.0.0-beta.5` and `@xstate/effect` to `1.0.0-beta.3` (ADR-0010). Its peer range is `vitest ^3 || ^4`; Vitest 5 works, because the package imports only Vitest types.
- The profile menu button has an accessible name (`aria-label={t("account")}`), so a Route Test and a screen reader can find it.
- The how-to for agents is `docs/test/model-tests.md`.
