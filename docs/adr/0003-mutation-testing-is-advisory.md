# Mutation testing is advisory

We run [StrykerJS](https://stryker-mutator.io/) with the Vitest runner over the same allowlist coverage measures, to answer the question coverage cannot: *would a test notice if this line were wrong?* It is on-demand and gates nothing — `break: null`, a `workflow_dispatch` job of its own, no PR gate, and no place in `ci.yml`.

> **Note (2026-09-02):** `@workspace/web` was removed from the monorepo. Tables and file paths below that name `apps/web/...` are historical measurements from when that app existed; they are not current mutate targets.

Precisely: **no mutation score can fail anything.** `break: null` means Stryker exits 0 whatever the score, and the job is never triggered by a push or pull request. A crash or a broken config will still red-X that dispatched run, which is intended — you want to know the tool is broken.

Depends on [ADR-0001](./0001-unit-tests-are-pure-module-logic.md), revises nothing in it.

## Why not a gate

The obvious shape — a mutation-score threshold on every PR — is unavailable, because the runner does not currently produce stable verdicts.

[stryker-js#6073](https://github.com/stryker-mutator/stryker-js/issues/6073) (open) reports non-deterministic mutant verdicts under `coverageAnalysis: "perTest"` on vitest 4.1.9/4.1.10 with vitest-runner 9.6.1 — the versions we are on. The same mutant flips `Survived` ↔ `Killed`/`Timeout` across identical runs. [stryker-js#6146](https://github.com/stryker-mutator/stryker-js/pull/6146) (open, unmerged) traces it: under load, a filtered mutant run can complete with its tests collected but never executed; the runner's `.filter((test) => test.result)` then empties the result list and `toMutantRunResult` reports **Survived** with `hitCount 0`. A mutant that no test ran against proves nothing, but it is counted as if it did.

`coverageAnalysis` is not a lever — the vitest runner ignores the option and always uses `perTest`.

A flaky gate is worse than no gate: it gets disabled or forced through within a fortnight, which is the same failure mode ADR-0001's coverage amendment warns about. So mutation score is a **ceiling we look at**, deliberately, against coverage's **floor we enforce** at 90/perFile.

## Vocabulary

**Candidate Survivor**: A mutant Stryker reports as `Survived` that has not been reproduced by hand. Because of #6073 the report's `Survived` count is an upper bound, not a finding. Promote one to a real gap only after applying the mutation manually and watching its covering tests still pass. _Avoid_: survivor, missed mutant, coverage gap

**Equivalent Mutant**: A mutation that cannot change observable behaviour, so no test can kill it — typically on a branch unreachable by construction. Suppressed at the site with `// Stryker disable next-line <Mutators>: <proof>`, never by widening `mutator.excludedMutations`. _Avoid_: false positive, unkillable, noise

> **Suppress only what is un-killable, never what is merely untested.** A survivor you *could* kill with a better assertion is the finding. If you cannot write the one-sentence proof of unreachability into the `: reason`, it is not an Equivalent Mutant — it is a missing test.

Suppress the narrowest thing that is provably equivalent. `disable next-line all` is almost always too broad. The real example, from `apps/web/src/core/utils/net.ts`:

```ts
return xForwardedFor.split(",")[0]?.trim() ?? null;
```

Two mutants survive here. `OptionalChaining` (drop `?.`) is equivalent — `split` always yields a first element. `MethodExpression` (drop `.trim()`) is **killable**: a space-padded `X-Forwarded-For` header would catch it, and no test sends one. That second one is a real gap, and `disable next-line all` would have buried it.

### Two mechanical traps

**`v8 ignore next` and `Stryker disable next-line` cannot stack.** Both mean "the line below", so whichever sits on top targets the *other comment* rather than the code, and silently does nothing. Use Stryker's block form (`disable` … `restore`) around the `v8 ignore` instead.

**`// Stryker restore` must lead a statement.** Placed as a trailing comment inside a block — after a `return`, before the closing `}` — Babel attaches it to the return statement and Stryker never reads it. The `disable` then runs to end of file. Observed live: it silently ignored an unrelated, killable `match?.[1]` twenty lines further down. Put `restore` outside the block, leading the next real statement, and verify with a scoped run that only the intended mutant reports `Ignored`.

## Scope is derived, not copied

ADR-0001 makes `coverage.include` *the* definition of business logic. `stryker.config.mjs` imports `vitest.config.ts` and derives `mutate` from it, rather than restating it — which is why the config is `.mjs` and not `.json`.

A copied list would drift silently, and in the flattering direction: add a thinly tested file to `coverage.include`, and a copied `mutate` would leave it unmutated, *raising* the mutation score. Derivation means scope follows the allowlist automatically.

**There are no mutation-only subtractions.** `mutate` is the coverage allowlist and nothing else.

Three were drafted before the first run, on the theory that "constants" and "config-shaped output" are literal churn worth skipping. Measurement killed all three:

| Drafted subtraction | Assumed | Measured |
| --- | --- | --- |
| `!**/constants/**` | literal tables | `packages/core/src/constants/core.ts` scores **100%** (a `reduce` and `* 1024` arithmetic); `apps/expo/src/core/constants/global.ts` holds a real `windowDimension.width > 768` breakpoint whose `EqualityOperator` mutant **survives** |
| `!packages/core/src/constants/http.ts` | "106 lines of literal table" | **0 mutants.** It is numeric status codes and type aliases; Stryker has no numeric-literal mutator. The glob was dead config, and the `"application/json"` example justifying it does not appear in the file |
| `!apps/web/src/app/{robots,sitemap}.ts` | literal-table shape | `robots.ts` **100%**, `sitemap.ts` **93.18%** — among the best-scoring files in the repo |

The lesson is the rule: **a directory name is not evidence, and neither is a plausible-sounding example.** Subtract a file only after reading a report for it.

What that leaves is genuine, accepted noise rather than hidden noise: roughly 18 of the surviving mutants are `StringLiteral` replacements on exported name constants (`apps/{spa,web}/src/core/constants/global.ts`, `packages/core/src/constants/date.ts` — telemetry meter and tracer names). Killing those requires a test that restates the constant, which is the padding ADR-0001's coverage amendment exists to prevent. They stay visible and unkilled. Treat a `StringLiteral` survivor on a bare name constant as known noise; treat any *other* mutator surviving in those files as a real finding, which is exactly the distinction a blanket exclusion would have destroyed.

`mutator.excludedMutations` is set to `[]` explicitly rather than omitted, so the choice is visible where a reader would look for it. It is the right escape hatch for "this whole mutator class is noise here", but that is an empirical claim, and making it before reading a report blinds the tool to its own best findings — the same mistake the blanket `constants` glob made.

### Scope overrides replace, they do not intersect

Stryker's `-m` / `--mutate` **replaces** the config's `mutate` array outright. A convenience script like `stryker run -m 'packages/core/src/**/*.ts'` therefore does not mean "the derived scope, narrowed to core" — it means "every `.ts` under core", including the `*.unit.test.ts` files and everything ADR-0001 leaves off the allowlist. That is a second definition of scope wearing a helpful disguise, so no such scripts exist; `bun test:mutate` is the only scoped entry point, and at under three minutes there is nothing to save by narrowing it.

The `mutate` input on the `workflow_dispatch` job is the one exception, kept for ad-hoc investigation and labelled in its own description as replacing the derived scope. Results from a run that used it are not comparable to the baseline table below.

## Settings that are hedges, not preferences

Each of these costs wall-clock and buys verdict stability. All should be revisited if #6146 ships.

- **`disableBail: true`** — the runner forces `bail: 1` otherwise. #6146 finds the lost runs cluster *after bail-aborted runs*, so removing bail removes the trigger. Cost: every mutant runs all its covering tests instead of stopping at the first failure.
- **`concurrency: 2`** — the other precondition in #6146 is load; the default is `cores - 1`.
- **`incremental: false`** — incremental mode caches verdicts, so a phantom survivor would freeze into the baseline until its file next changed, *and look stable*. `bun test:mutate:inc` opts in for local iteration, where you are reading only the file you are changing. The baseline is also unstable on disk ([#6004](https://github.com/stryker-mutator/stryker-js/issues/6004): test IDs are assigned in discovery order, so a no-op run rewrites ~15k lines), so it is written to the gitignored output directory rather than committed.

**Output goes to `coverage/stryker/`**, alongside `coverage/vitest/`. Both are test reports, both fall under the bare `coverage` rule in `.gitignore`, and keeping them siblings means one place to look. The `incrementalFile` path is set explicitly for the same reason — Stryker otherwise defaults it to `reports/`, a directory nothing else here uses. The *root* of `coverage/` remains fallow's runtime sidecar traces; see the comment in `vitest.config.ts`.

Being slow is the cheapest property of a tool nobody waits on.

## What the runner does to the Vitest config

Verified against `packages/vitest-runner/src/vitest-test-runner.ts`, because the docs page understates it:

- **Vitest `projects` are supported.** `init()` walks `ctx.projects` and *prepends* its instrumentation setup to each project's `setupFiles`, so `vitest.setup.ts` and `vitest.msw-setup.ts` still run.
- **`isolate` is untouched.** On vitest ≥4.1 it sets `pool: "threads"`, `maxWorkers: 1`. One worker with a shared module registry — the conditions `vitest.msw.ts` already documents for its single `setupServer`.
- **`passWithNoTests: false` is harmless.** The runner catches Vitest's `FILES_NOT_FOUND` error code and continues.
- Also forced: `maxConcurrency: 1`, `coverage.enabled: false`, `watch: false`, `onConsoleLog: () => false`.

## Measured baseline

First full run, 2026-08-03, `@stryker-mutator/core@9.6.1` + vitest 4.1.10:

| | |
| --- | --- |
| Files mutated | 57 |
| Mutants | 1642 |
| Killed / Survived / Timeout / No coverage / Errors | 1394 / 225 / 19 / 3 / 0 |
| **Mutation score** | **86.11%** |
| Wall clock | 3m 07s (`disableBail: true`, `concurrency: 2`) |

Under 3 minutes, not the hours those settings suggest — the suite is boilerplate-sized and 331 tests run in 4.5s. Cost is not a reason to relax any of the determinism hedges.

**Determinism check.** Two consecutive full runs produced byte-identical results — all 88 per-file rows, and identical status counts. That is the evidence `disableBail` + `concurrency: 2` actually work here; re-run it before trusting a report if either setting changes.

The result is the argument for the tool. Every module below is at or near 100% *line* coverage; mutation disagrees:

### Do not triage by score

**A low mutation score does not rank work.** Of 225 survivors, roughly 158 are literal-and-shape mutants (`StringLiteral`, `ObjectLiteral`, `ArrayDeclaration`, `BooleanLiteral`) and 67 change a decision. Files differ wildly in that mix, so score ranks *literal density*, not *risk*:

| Module | Score | Behavioural survivors |
| --- | --- | --- |
| `apps/web/src/core/utils/seo.tsx` | **worst in repo** — 54.69%, 64 mutants | **2** — the rest is `"Indonesia"`, `"en_US"`, image dimensions |
| `apps/web/src/core/middlewares/rate-limit/store.ts` | outside the worst 8 — 66.67% | **16** — including off-by-one boundaries in a rate limiter |

Sorting the HTML report by score sends you to `seo.tsx` and away from the rate limiter. So read the survivor list, not the column.

The report's own filters are **status-only** (`Killed`, `Survived`, `Timeout`, `NoCoverage`, `Ignored`, `CompileError`, `RuntimeError`) — `mutation-testing-elements` has no mutator-name filter, so it cannot do this for you. Query `coverage/stryker/mutation.json` ad hoc when you want a ranking.

**Mutator class is a hint you eyeball, never a filter that hides.** A committed `scripts/mutation-triage.mjs` used to bucket the four literal mutators as "noise" and suppress them behind a count. It was deleted, because the premise is false often enough to matter — every one of these is killable and was being hidden:

| Site | Mutant | Why it is behaviour, not noise |
| --- | --- | --- |
| `rate-limit/core.ts:23` | `standardHeaders = "draft-6"` → `""` | Selects which RFC draft header format the limiter emits |
| `packages/core/src/utils/core.ts:268` | `createObjectToFormData("index")` → `""` | That argument is the array-index key format for generated FormData keys |
| `packages/core/src/utils/dom.ts:27` | `link.target = "_blank"` → `""` | Changes whether the download opens in a new tab |

That is the same error as the blanket `!**/constants/**` glob above — a proxy standing in for reading the report — except in code, where it fails silently on every run instead of loudly once. The accepted-noise classes named in this ADR are specific sites argued individually; they are not a mutator whitelist.

It is also why `mutator.excludedMutations` stays empty rather than dropping `StringLiteral` globally, tempting as ~103 survivors makes it: the three rows above would vanish with it.

### Where the score is low

| Module | Mutation score | Mutants | Class |
| --- | --- | --- | --- |
| `apps/spa/src/core/constants/global.ts` | 0.00% | 12 | accepted noise (name constants) |
| `apps/web/src/core/constants/global.ts` | 0.00% | 4 | accepted noise (name constants) |
| `packages/core/src/constants/date.ts` | 33.33% | 3 | accepted noise (format strings) |
| `packages/core/src/apis/auth.ts` | 50.00% | 12 | accepted noise (Zod half of a mixed module) |
| `apps/web/src/core/utils/seo.tsx` | 54.69% | 64 | **Candidate Survivors** |
| `apps/web/src/core/utils/evlog.ts` | 56.00% | 25 | **Candidate Survivors** |
| `apps/expo/src/core/hooks/use-app-store.tsx` | 62.50% | 16 | **Candidate Survivors** |
| `packages/core/src/utils/logger.ts` | 62.96% | 27 | mostly accepted noise |

The point of the fourth column: a low score is not automatically a finding. Four of the eight worst-scoring modules are noise this ADR has already argued is not worth killing — they are listed rather than excluded precisely so the distinction stays visible and re-checkable. `seo.tsx` is the real work.

Against all that, `apps/web/src/core/utils/{security,error-helper,field-error-message,server-form-error,net,primitive}.ts` all score 100%, as do `apps/web/src/app/robots.ts` and `og-params.ts`. This is not a uniform "the tests are weak" signal; it is specific, which is what makes it actionable.

The second accepted-noise class, alongside the name constants above: **Zod constraint mutants in mixed schema/repository modules** (`apis/{auth,better-auth}.ts`) — `z.string().min(6)` → `.max(6)`, and similar. ADR-0001 puts plain Zod shapes out of test scope, and these files stay in the allowlist only because their `authKeys`/`authRepositories` functions are MSW-tested. The schema half is therefore unasserted by policy, not by accident. Pure-schema modules were removed from the allowlist outright on 2026-08-03 (ADR-0001 amendment) — this report is what caused that.

Two findings confirmed and fixed on adoption, as the worked example of the loop:

| Module | Before | After | What was missing |
| --- | --- | --- | --- |
| `apps/web/src/core/utils/net.ts` | 92.59% | **100%** | No test sent a space-padded `X-Forwarded-For`, so nothing pinned `.trim()` |
| `apps/web/src/core/utils/primitive.ts` | 50.00% | **100%** | `cx()`'s array-unwrap branch was asserted with `toContain`, which passes either way because `twMerge` flattens a nested array to the same string. Killing it needed a render function as the array's last element (function vs string result), plus a case with an array *among several* args to pin the `args.length === 1` half of the guard |

| `apps/web/src/core/middlewares/rate-limit/store.ts` | 66.67% | **85.54%** — all 16 logic survivors killed; the 12 that remain are log-message literals | The tests asserted `totalHits`, which is read back from the *mocked* update result — so they proved the mock, not the store. Every arithmetic and boundary mutant in the counting logic was invisible. Fixed by asserting the `set()` payload the store actually writes, adding both `lastRequest === windowStart` boundary cases, and asserting `log.error` was **not** called on the `!record` and empty-`returning()` paths — those yield `undefined`/`1` whether they take the intended branch or get rescued by the `catch`, so only the absence of a logged error tells them apart |

The `primitive.ts` case is the argument for mutation testing in one line: the branch had a test, the test passed, the test proved nothing. `store.ts` is the same argument at scale, in a rate limiter — a component where an off-by-one on a window boundary is a security concern, not a style one.

`store.ts` also lost a redundant guard. `if (result.length === 0) return;` sat directly above `if (!record) return;`, and destructuring an empty array already yields `undefined`, so every mutant of the length check survived: no input can reach one guard without the other producing the same result. The right response to provably redundant code is deletion, not a `// Stryker disable`.

Findings left open deliberately: `packages/core/src/utils/core.ts` (17 logic survivors, 13 of them `Regex` — each pattern is exercised by one happy input), `packages/core/src/libs/i18n/init.ts` (11, all `OptionalChaining` on plural/date/list fallbacks), and `packages/core/src/utils/cookie.ts` (9, including the same dropped-`.trim()` shape already fixed in `net.ts`). The `ObjectLiteral → {}` survivors across `evlog.ts` mean nothing asserts the shape of emitted telemetry payloads — real, but asserting telemetry bodies is brittle enough to defer. Working through survivors is the tool's ongoing job, not part of adopting it.

Stryker also warns that 251 mutants (16%) are *static* — evaluated at module load — and estimates them at 95% of run time. `ignoreStatic` would skip them, but they are skipped as **Ignored**, not killed, so it buys speed by discarding signal. At a 3-minute run there is nothing to buy. Left off.

## Getting it to run at all

Three environment fixes were needed before the first successful run. Each is a workaround with a removal condition, not a preference.

1. **`plugins: ["@stryker-mutator/vitest-runner"]`** — bun installs into an isolated `node_modules/.bun/` store and symlinks, which defeats Stryker's default `@stryker-mutator/*` plugin glob. Without it the runner never loads and `vitest` is reported as an unknown config option — a warning, not an error, so it fails confusingly later.
2. **`tsconfigFile` pointed at a non-existent file** — see the comment in `stryker.config.mjs`. #6111 is not confined to the typescript-checker: Stryker's own `TSConfigPreprocessor` calls `ts.parseConfigFileTextToJson`, which typescript@7 removed, and it runs on every project that has a `tsconfig.json`. Declining the checker does **not** avoid it. Safe here only because no tsconfig in this repo uses a relative `extends` or any `references` — the preprocessor would have nothing to rewrite anyway.
3. **`ignorePatterns`** — Stryker copies the project into `.stryker-tmp` with `fs.copyFile`, which fails on anything that is not a regular file. `.claude/skills` is a symlink to a directory (ENOTSUP) and `apps/expo/ios/Pods` is full of broken symlinks (ENOENT). Pruning tooling, docs and native build output also takes the sandbox from 12,303 files to 603, which is most of why a run is under 3 minutes.

`.fallowrc.json` also needs two entries, since fallow reads only the import graph: `stryker.config.mjs` joins the root-config `unused-files: off` override (nothing imports a file its own CLI loads), and `@stryker-mutator/core` / `@stryker-mutator/vitest-runner` join `ignoreDependencies` — they are resolved by binary and by plugin name (`testRunner: "vitest"`), never imported, so fallow reports them unused. That array is a flat list of package names with nowhere to put a `$comment`; this paragraph is the record.

## Sandbox and the workspace aliases

Stryker copies the repo into `.stryker-tmp` and symlinks `node_modules`, so `node_modules/@workspace/core` inside the sandbox still resolves to the real, **unmutated** `packages/core`.

We are saved by the alias: all four Vitest configs map `@workspace/core` to an absolute `packages/core/src` path built from `import.meta.dirname`, which re-resolves inside the sandbox. Replacing those path aliases with bare package resolution would silently stop mutants in `core` from ever reaching the app projects' tests.

> [ADR-0004](./0004-module-resolution-has-a-single-source-of-truth.md) removed the equivalent aliases from the app tsconfigs and from `apps/spa/vite.config.ts`, in favour of `@workspace/core`'s `exports` map. The four **Vitest** aliases named above are deliberately exempt, for the reason in this section. Do not delete them for consistency with that ADR — no test would fail if you did.

## Considered Options

- **PR gate on mutation score** — rejected; #6073 makes it flaky, and a flaky gate gets disabled.
- **Scheduled gate on `main`** — rejected for now; same flakiness, deferred rather than dismissed.
- **Four per-project Stryker configs** — rejected; loses cross-context kills on `core`, which is aliased into all three apps, and the per-project configs are `defineProject` so they carry none of the root options.
- **A standalone `mutate` list** — rejected; see "Scope is derived".
- **An Ignorer plugin** (StrykerJS's answer to Stryker.NET's `ignore-methods`) — rejected; only ~10 logging call sites fall inside the mutation scope, and per-site annotation forces the reason the plugin would hide.
- **Patching the runner** with #6146 via `bun patch` — rejected while advisory; it means owning a fork of an unmerged PR that rots on every upgrade. Reconsider if this ever gates.
- **`@stryker-mutator/typescript-checker`** — rejected; it would usefully discard non-compiling mutants, but we are on `typescript@7` and [#6111](https://github.com/stryker-mutator/stryker-js/issues/6111) is open. Note this rejection does *not* by itself avoid #6111 — see "Getting it to run at all". Revisit when it closes.
- **`ignoreStatic: true`** — rejected; it converts 16% of mutants to `Ignored` rather than testing them, trading signal for speed we do not need at a 3-minute run.

## Note on syntax

Stryker.NET's [ignore-mutations docs](https://stryker-mutator.io/docs/stryker-net/ignore-mutations/) are the first hit for this topic and the syntax is *not* portable. `// Stryker disable once all` is .NET-only; in JS it is `// Stryker disable next-line all`. A copied `once` directive is not an error — it silently does nothing, and the mutant stays live.
