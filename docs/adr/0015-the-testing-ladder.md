# The testing ladder

> Recorded on 2026-11-26, because no document said which check must catch which kind of failure. Builds on [ADR-0001](./0001-unit-tests-are-pure-module-logic.md) (unit tests), [ADR-0002](./0002-network-boundary-mocking-with-msw.md) (MSW), [ADR-0003](./0003-mutation-testing-is-advisory.md) (Stryker), [ADR-0005](./0005-dast-scans-the-deployed-spa.md) (DAST), [ADR-0008](./0008-route-tests-run-in-vitest-browser-mode.md) (Route Tests), [ADR-0009](./0009-property-tests-use-fast-check.md) (Property Tests) and [ADR-0011](./0011-model-tests-use-xstate-test.md) (Model Tests). Revises none of them.

The repo has many checks: typecheck and oxlint (with types and with local rules), fallow (boundaries, dead code, duplicates), Example Tests, Property Tests, Model Tests, Route Tests, Stryker, DAST and the security scans. Each ADR above tells how one check works. No document told which check must catch which kind of failure. Thus a person or an agent can write a Route Test for a bug that a unit test can catch, or a unit test for a bug that only a deployed page can show.

A lint rule cannot know which kind of failure a change can cause. Thus this ADR states the rule as a table.

## Vocabulary

**Testing Ladder**: The ordered list of checks in this repo, from the fastest and most local (typecheck) to the slowest and least local (DAST). _Avoid_: test pyramid, test strategy

**Rung**: One check on the Testing Ladder. A lower Rung runs sooner, runs faster, and points to a smaller part of the code when it fails. _Avoid_: level, layer, tier

**Lowest Rung**: For a failure kind, the lowest Rung that can catch it. _Avoid_: right test, best test

## The ladder

| #   | Rung                       | Command                                                        | Where it runs                     | PR gate  |
| --- | -------------------------- | -------------------------------------------------------------- | --------------------------------- | -------- |
| 1   | Typecheck and oxlint       | `bun lint`                                                     | `ci.yml`, each PR                 | Yes      |
| 2   | fallow                     | `bun run check:all` (boundaries, dead code, duplicates, health) | `ci.yml`, each PR                 | Yes      |
| 3   | Example Test               | `bun run test` (`*.unit.test.ts`)                              | `ci.yml` `unit`, each PR          | Yes      |
| 4   | Property Test              | `bun run test` (`test.prop`, `it.effect.prop`)                 | `ci.yml` `unit`, each PR          | Yes      |
| 5   | Model Test (unit)          | `bun run test` (`*.model.unit.test.ts`)                        | `ci.yml` `unit`, each PR          | Yes      |
| 6   | Route Test                 | `bun spa test:e2e` (`*.e2e.test.tsx`)                          | `e2e.yml`, push to `main`         | No       |
| 7   | Stryker                    | `bun run test:mutate`                                          | `mutation.yml`, on demand         | Advisory |
| 8   | DAST                       | `ZAP_TARGET=… bun zap:spa`                                      | `dast.yml`, weekly and on demand  | No       |

"PR gate" tells if a red result blocks a pull request. Route Tests do not run on pull requests (ADR-0008). DAST scans the deployed SPA and is inert until `SPA_TARGET_URL` is set (ADR-0005). A failure that only Rungs 6–8 can catch is found after the merge.

The security scans (gitleaks, zizmor, SCA, CodeQL) are not on the ladder. Each one has one failure kind only, and the table below names it.

## Decisions

- **Put each check on the Lowest Rung.** Before you write a check, find the failure kind in the table below. Write the check on its Lowest Rung. A check on a higher Rung is slower, can be flaky, and points to more code when it fails.
- **A higher Rung needs a reason.** If you write a check on a higher Rung than the table gives, write the reason in the test name or in the PR body. A good reason is that the lower Rung cannot see the failure, for example a bug in the wiring of real providers.
- **A failure on a high Rung adds a check on its Lowest Rung.** If a Route Test, Stryker or DAST finds a bug, find its failure kind. Add the regression check on the Lowest Rung of that kind, then fix the bug. Keep the high check only if it gives a different fact.
- **A known bad code shape becomes a lint rule.** If the same mistake occurs two times and a rule can see it in the syntax or in the types, write an oxlint rule in `tools/lint/`. A rule catches the mistake in each file, also in files that have no test.
- **Coverage is a floor, not a Rung.** The coverage gate of ADR-0001 tells that a test runs a line. It does not tell that the test can catch a failure. Stryker (Rung 7) tells that.

## Failure kinds

| Failure kind                                                                                          | Lowest Rung                       | Why a lower Rung cannot catch it                                                     | ADR                |
| ----------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| A wrong type, a missing argument, a call to a function that does not exist                           | 1 Typecheck                       | —                                                                                    | —                  |
| A known bad code shape: a fixed sleep, a mutation with no Retry Safety, a KVS key with no version, `Effect.runPromise` in a test | 1 oxlint (local rule)             | —                                                                                    | 0012               |
| A wrong import in a workspace: a feature imports another feature, or shared code imports a feature             | 2 fallow boundaries               | Types are correct; only the import graph is wrong                                    | 0007               |
| A wrong import across workspaces: an app imports another app, or core imports an app            | 1 oxlint (`no-restricted-imports`) | —                                                                                    | 0007               |
| Dead code, an unused dependency, a duplicate function, an import cycle                               | 2 fallow                          | The code compiles and runs                                                           | —                  |
| A pure function gives a wrong value for a known input                                                | 3 Example Test                    | The types are correct; only a run shows the value                                    | 0001               |
| A wrong URL, a dropped header, a response that does not parse                                        | 3 Example Test with MSW           | Only a run of the real `Http` and Schema shows the request                           | 0002               |
| A rule fails only for some inputs: an edge value, a round trip, an order of items                    | 4 Property Test                   | An Example Test has only the inputs that a person thinks of                          | 0009               |
| A stateful flow fails only in some orders of events: a login while a refresh runs                    | 5 Model Test (unit)               | A Property Test of one function does not send events in many orders to a flow        | 0010, 0011         |
| A route, a guard, a provider or a translation is not connected, or the page shows the wrong thing    | 6 Route Test                      | The unit suite has no browser and does not mount the app (ADR-0001)                  | 0008               |
| A UI flow fails only in some orders of events                                                         | 6 Model Test (Route Test)         | The same as the row above                                                            | 0011               |
| A test runs a line but does not see a wrong value on it                                              | 7 Stryker                         | Coverage tells only that the line ran                                                | 0003               |
| A missing or wrong security header, a weak CSP, a cookie flag, a hosting redirect                    | 8 DAST                            | The hosting configuration sets these; the test server does not read it (ADR-0005)    | 0005               |
| A key or a password in a commit                                                                       | gitleaks (`ci.yml`)               | —                                                                                    | —                  |
| A dependency with a known vulnerability                                                              | SCA (`security.yml`)              | —                                                                                    | —                  |
| An unsafe data flow in the source (injection, an open redirect)                                      | CodeQL (`security.yml`)           | A test checks only the inputs that it sends                                          | —                  |

## Considered Options

- **A lint rule that finds a test on the wrong Rung** — rejected. A rule cannot know which failure a test is for.
- **A test pyramid with three layers (unit, integration, end-to-end)** — rejected. It puts Property Tests, Model Tests and MSW tests in one layer, and it has no place for lint, fallow, Stryker or DAST.
- **One Rung for each tool** — rejected. Example Tests, Property Tests and unit Model Tests are all in the one Vitest `unit` job, but each catches a different failure kind.

## Consequences

- `AGENTS.md` (Testing section) links this ADR, so an agent reads it before it writes a check.
- A new check type gets a row in "The ladder" and rows in "Failure kinds", in the same change as its ADR.
