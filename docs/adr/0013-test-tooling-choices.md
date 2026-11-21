# Test tooling choices

> Recorded on 2026-11-20 from the comments in the root Vitest, MSW, fast-check and Stryker files ([ADR-0011](./0011-code-carries-no-comments.md)). Builds on [ADR-0001](./0001-unit-tests-are-pure-module-logic.md), [ADR-0002](./0002-network-boundary-mocking-with-msw.md), [ADR-0003](./0003-mutation-testing-is-advisory.md), [ADR-0004](./0004-module-resolution-has-a-single-source-of-truth.md) and [ADR-0009](./0009-property-tests-use-fast-check.md).

## Vitest (`vitest.config.ts`, `vitest.setup.ts`)

- `clearMocks: false`. Vitest 5 clears the mock history before each test by default, but some unit files assert side effects of module init or `beforeAll` (MSW, web-vitals, the Expo composition roots).
- `vitest.setup.ts` does not call `vi.restoreAllMocks()`. With `pool: "threads"` and `isolate: false`, the files in one worker share the hoisted `vi.mock` state. A restore after one file clears the call history that module-init tests in another file read.
- `vitest.env-mock.ts` is a mutable env bag. Tests change it with `.set` in `beforeEach`, and `vitest.setup.ts` resets it between files, because isolation is off.
- `coverage` can only be set in the root config (it is one of Vitest's `NonProjectOptions`). So `--project <name> --coverage` measures the global `include` list against a part of the suite and reports the other projects at 0%. Always run the whole suite: `bun test:unit:cov`.
- Coverage is opt-in. On by default, it slows every watch run and every `--project` run. The `unit` CI job adds `--coverage`.
- The coverage report goes to `coverage/vitest`, not to `coverage/`. The root of `coverage/` holds the runtime traces of Fallow. Test coverage there makes Fallow report the layers that ADR-0001 leaves untested as dead code. Stryker writes to `coverage/stryker`.
- The threshold (90, per file) is a floor below the measured baseline, not a target. The suite is at 100 only because the repo is small; a floor of 100 fails CI on the first new file that is only partly covered. Lower it only with a reason in the commit.
- `coverage.include` is the definition of business logic. A new folder with logic must be added, or its untested files never show in the report. It includes feature `api.ts`/`queries.ts` files and the Session gate of the SPA router (which lives in `app/` because ADR-0007 puts it in app composition). It excludes `schemas.ts` (a schema file runs every line on import, so it scored 100% with no test; mutation testing found 9.09%), React hooks and providers, and the composition roots (env, Layer, Persistence, Session, runtime). Adapters with their own logic, such as `layers/mmkv.ts`, stay in.
- The SPA project transforms JSX in tests although its tsconfig has `jsx: "preserve"`, because unit tests import `.tsx` modules (the router and its providers).

## MSW (`vitest.msw.ts`)

- `MSW_BASE_URL` is one shared absolute URL. `setupServer` runs in Node with no `document.baseURI`, so handler paths must be absolute. `apps/expo/vitest.config.ts` imports it for its `env`, so the value is defined once.
- There is one `setupServer`, with no default handlers. Each test declares its requests with `server.use()`, and an unhandled request fails the run. Two instances would fight over the same patched `fetch`, `http` and `XHR`, because isolation is off.

## fast-check (`vitest.fast-check.ts`, `vitest.arbitraries.ts`)

- The settings are evaluated once per module graph, so the plugin is installed once per test file (or once per worker), never twice in one graph. `FC_NUM_RUNS` sets the runs per Property Test; `FC_SEED` replays a failure from its Replay Line. fast-check has no global `path`, so the shrink path cannot be replayed; the seed alone finds the same minimal counterexample.
- Global `numRuns` stays unset unless an env var sets it. The `g` mode of `@fast-check/vitest` reads `numRuns ?? 1`, so a global 100 runs each `g` test 100 times.
- Under Stryker (`STRYKER_MUTATOR_WORKER`, which Vitest threads inherit), the seed is fixed: `@fast-check/vitest` puts the seed in the test name, Stryker maps mutants to tests by name, and ADR-0003 needs stable verdicts. Runs drop to 10, because each mutant runs every covering test (`disableBail`).
- `ioPropertyParameters` lowers the runs for a Property Test that crosses MSW (2–3 ms per run). A global `numRuns` still wins, because a per-test `numRuns` would override it.
- `vitest.arbitraries.ts` and `vitest.msw.ts` are at the root, outside every `src/`, so coverage and Stryker never measure them. The arbitraries import core by relative path, because the root is not a workspace package.
- `httpErrorStatusArb` always excludes 407: `fetch` turns a 407 into a network error, so it never reaches the client as a response.

## Stryker (`stryker.config.mjs`)

- It is `.mjs`, not `.json`, because the mutation scope is derived from `coverage.include`. A copy would drift in the flattering direction: a new file with few tests would not be mutated and would raise the score. The config fails at once if the shape of that list changes, because a silent change would mutate nothing.
- No subtraction from that scope and no excluded mutator, until a report shows the reason. Three subtractions were drafted on a guess, and all three were wrong when measured.
- Editor validation comes from `$schema`, not from a JSDoc `import()`, which would make `@stryker-mutator/api` an undeclared dependency.
- `plugins` names the runner, because Bun's isolated `node_modules/.bun/` store defeats the default `@stryker-mutator/*` glob.
- `vitest.configFile` is the root config, so all three projects load. Core is aliased into the SPA and Expo, so their tests kill core mutants too.
- `coverageAnalysis` is not set: the Vitest runner always uses `perTest`. `thresholds.break` is `null`, so nothing fails a build.
- Incremental mode is off by default. Under stryker-js#6073 it freezes a false survivor until its file changes. `bun test:mutate:inc` turns it on for local work, with its file in the git-ignored report folder (stryker-js#6004).
- Reports go to `coverage/stryker`, as `html` and `json`, so two runs can be compared.
- `ignorePatterns` prunes `.claude` (a symlink that `copyfile` cannot copy), agent and doc folders (about 12,000 files that no test reads), and native build output (`apps/expo/ios/Pods` has broken symlinks).

## Single cases

- `invariant.unit.test.ts` calls `invariant` through an annotated `const`: a statement-level call to an `asserts` function needs an explicit type annotation, which an import binding cannot have (TS2775).
- Timeout tests in `http.unit.test.ts` use `it.live`, because the TestClock of `it.effect` freezes the real clock that the timeout uses.
- In Node, TanStack Router acts as a server: it returns a redirect and does not follow it.
- `new MMKV()` needs a real constructor, so its mock is a class, not an arrow `vi.fn`.
