# Property Tests use fast-check

Unit tests use [fast-check](https://fast-check.dev/) through `@fast-check/vitest` for property-based testing and for controlled random values. One engine serves all three projects (`core`, `spa`, `expo`), including the files that test Effect code. The global settings are in `vitest.fast-check.ts`, which `vitest.setup.ts` imports. Route Tests ([ADR-0008](./0008-route-tests-run-in-vitest-browser-mode.md)) are out of scope.

Depends on [ADR-0001](./0001-unit-tests-are-pure-module-logic.md) (scope of the unit suite) and [ADR-0003](./0003-mutation-testing-is-advisory.md) (Stryker). Revises neither; each has a note that points here.

> On 2026-11-24, Model Tests were added with `@xstate/test` ([ADR-0011](./0011-model-tests-use-xstate-test.md)). Its `propertyTest()` runs on fast-check (`fc.check`), so the settings of this ADR (seed policy, run budget, Stryker, Replay Line) apply to it unchanged. The rejection of Property Tests in Route Tests below still holds: a Route Test Model Test uses `testPaths()`, which runs a fixed set of paths, not random runs.

## Vocabulary

**Property Test**: A test that states a rule that is always (or never) true for a family of inputs, and lets fast-check generate the inputs and shrink a failure to a minimal counterexample. In code it is `test.prop([...arbitraries])(...)`. _Avoid_: fuzz test, random test, generative test

**Example Test**: A test with chosen inputs and an exact expected output. It documents how to use the code. Example Tests come first in a `describe`; Property Tests come after them. _Avoid_: unit test (both kinds are unit tests), static test

**Replay Line**: The last line of a failed Property Test report: one shell command (`FC_SEED=<seed> bunx vitest run <file> -t "<name>"`) that reruns only that test with the seed that failed. _Avoid_: repro command, seed line

## Decisions

- **One engine, fast-check.** Effect 4 has its own `effect/Arbitrary` engine, and `@effect/vitest` exposes it as `it.prop` / `it.effect.prop`. We do not use it. Two engines would mean two run budgets, two seed policies and two failure formats.
- **`it` for examples, `test` for properties.** Example Tests use `it` from `vitest` (or from `@effect/vitest` in Effect files). Property Tests use `test.prop` from `@fast-check/vitest`, and a test that needs a value it does not care about, or an unstable value such as "today", uses `test(..., ({ g }) => …)` from the same package. The `it` of `@fast-check/vitest` is not used: it wraps every test, and runs it `numRuns ?? 1` times. With a global budget (Stryker, `FC_NUM_RUNS`) each example test ran 10–1000 times, and tests with a mock failed. The Effect files had a second reason: `it` from `@effect/vitest` is already in scope. An Effect property runs its program with `Effect.runPromise`.
- **Run budget.** Global settings leave `numRuns` unset, so `test.prop` uses the fast-check default (100). A global `numRuns: 100` would also run every `g` test 100 times. `FC_NUM_RUNS` overrides it for deep fuzzing; `bun run test:unit:fuzz` sets 1000 and a long test timeout, because 1000 MSW round trips take more than the 5 s default.
- **I/O-bound properties.** A property whose every run goes through MSW costs 2–3 ms per run. It passes `ioPropertyParameters()` (from `@test/arbitraries`) for 20 runs. That helper reads the global `numRuns` first, because a per-test `numRuns` would otherwise beat `FC_NUM_RUNS` and the Stryker budget.
- **Seed policy.** Local runs and CI use a new random seed for each run, so each run tries new inputs. `FC_SEED` fixes it to replay a failure.
- **Stryker.** Under Stryker (detected by `STRYKER_MUTATOR_WORKER`), the seed is fixed and `numRuns` is 10. The fixed seed is necessary, not only good: `@fast-check/vitest` adds `(with seed=…)` to the name of each `test.prop` test when it collects the file, and Stryker maps mutants to tests by name between the dry run and each mutant run. It also removes one more source of verdict flips (ADR-0003). The low `numRuns` is because `disableBail` reruns every covering test for every mutant.
- **Failure output for people and agents.** Shrinking stays on (no `endOnFailure`), so a report shows the minimal counterexample. A global plugin in `vitest.fast-check.ts` adds the Replay Line to the default report. `verbose` stays at the default, so the output stays short. fast-check has no global `path` option, so the Replay Line replays by seed only; the shrink then finds the same counterexample again.
- **Known bugs.** A bug that a property finds, and that the current task does not fix, is recorded with `it.fails("… (known bug)")` on its minimal example. The property is narrowed to the inputs that work, with a comment that names the bug. The `it.fails` goes red when the bug is fixed.
- **Shared arbitraries.** `vitest.arbitraries.ts` (alias `@test/arbitraries`) holds arbitraries for domain values that several files build, such as the Session. It is root-level test infrastructure, like `vitest.msw.ts`, so coverage and Stryker do not measure it. fallow reads it as production code, so `@fast-check/vitest` is in `ignoreDependencies`, as `msw` is.
- **Test style.** Unit tests follow the `javascript-testing-expert` skill (`.claude/skills/javascript-testing-expert/SKILL.md`): `describe` per function, `it("should …")`, a visible `// Arrange` / `// Act` / `// Assert`, Example Tests before Property Tests. Two repo rules win over the skill: file names stay `*.unit.test.ts` (ADR-0001), and the `// Helpers` section sits after the imports, above the `describe`s, because lint has `no-use-before-define` and `func-style`.
- **Arbitraries.** Use defaults. No `maxLength` or `min`/`max` unless the code under test requires it. Prefer constrained arbitraries and `map` over `filter` and `fc.pre`. Build inputs whose expected outcome you know; do not re-implement the code in the test.

The how-to for agents is `docs/agents/unit-tests.md`.

## Considered Options

- **Effect's `it.prop` for Effect files, fast-check elsewhere** — rejected; two engines and two configs. Reconsider if a test needs a Schema-derived arbitrary that is hard to write by hand.
- **Effect's engine only** — rejected; the plain modules (`utils/`, `i18n/`) are not Effect code, and the `g` mode and `fc.scheduler()` have no equivalent there.
- **A fixed seed everywhere** — rejected outside Stryker; it finds less over time. The cost of a random seed is that a Property Test can fail on an unrelated pull request. The Replay Line makes that failure cheap to reproduce, and it is a real bug.
- **A global `numRuns: 100`** — rejected; see "Run budget".
- **`endOnFailure: true`** — rejected; faster failures, but the report shows the first failing input, not the minimal one, which is worse for a person or an agent that must fix it.
- **Property Tests in Route Tests** — rejected; each run mounts the whole app in Chromium, so 100 runs is too slow, and the suite does not run on pull requests.

## Consequences

- Root `devDependencies` add `fast-check` and `@fast-check/vitest`, pinned exactly like the rest. Each test project aliases `@test/arbitraries`, and the core, spa and expo tsconfigs map it.
- `fetch` turns an HTTP 407 into a network error, so the status arbitraries of the `Http` tests leave 407 out.
- The name of a `test.prop` test changes with the seed. Filter with the stable prefix (`-t "should …"`), as the Replay Line does.
- A Property Test adds its 100 runs to the suite time. Keep the code under test fast or use `size: "-1"`; do not cap `maxLength` for speed.
