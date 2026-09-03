# Unit tests are pure module logic only

We run Vitest projects (`core`, `spa`, `expo`) for Unit tests: utils, libs, registries, plain classes, non-React factories, and Zustand stores via `.getState()`. React components/hooks (RTL, hook harnesses), plain Zod shapes, Vitest UI, and browser mode are out of scope — UI behavior belongs in Playwright E2E. Files are `*.unit.test.ts` under `environment: 'node'` with shared polyfills; all three projects run in a single CI job, `unit`.

> Coverage was originally out of scope too. That clause was reversed on 2026-07-28 — see [Amendments](#amendments).
> The four per-project CI jobs were collapsed into one on 2026-07-29 — same section.
> "Targeted mocks" was narrowed on 2026-07-30: API-layer tests now fake at the network boundary via MSW, not at the module boundary. Scope above is unchanged — see [ADR-0002](./0002-network-boundary-mocking-with-msw.md).
> A second tool now watches the same `coverage.include` allowlist from the other side: [ADR-0003](./0003-mutation-testing-is-advisory.md) derives its mutation scope from it. Coverage asks *did a test execute this line* (a floor, enforced); mutation asks *would a test notice if this line were wrong* (a ceiling, advisory).
> Its first report then revised the allowlist itself on 2026-08-03 — pure Zod schema modules were scoring a free 100% — see [Amendments](#amendments).

## Considered Options

- React Testing Library for components/hooks — rejected; duplicates E2E cost and slows the suite
- happy-dom/jsdom by default — rejected; Node + targeted mocks is faster for pure logic
- Coverage gates — rejected; optimize for wall-clock speed, not % lines (partially reversed — see Amendments)

## Amendments

**2026-07-28 — coverage is in scope as a reporting tool.** Coverage *measurement* is in scope; coverage *targets* are not. The original rejection conflated them: an aspirational gate ("must hit 80%") invites padding tests and pressures contributors toward unit-testing UI, but a floor pinned to the measured baseline only detects regression. Cost is +1.4s (~29%) on the warm suite — `v8` needs no pre-instrumentation pass, and `coverage.enabled` stays `false` so watch runs and focused `--project` runs are untouched.

Coverage measures business logic, defined by the `coverage.include` allowlist in `vitest.config.ts`. That list is a specification: a file appears in the report, covered or not, only if matched there. It holds together on one convention, named here because the codebase already practises it:

> **Logic Seam** — a framework entry point holds no logic. It delegates to a plain `.ts` sibling, and the sibling is what gets unit-tested and measured (`app/api/og/route.tsx` → `og-params.ts`).

Logic left inside a shell is therefore invisible to coverage by design — that absence is the signal to extract it. Note `.tsx` is not a proxy for UI here: `core/utils/seo.tsx` and both Zustand stores are `.tsx` business logic.

`thresholds` is a floor, not a target — `autoUpdate: false`, `perFile: true`. First baseline 2026-07-28: statements 90.1%, branches 78.33%, functions 84.64%, lines 90.05%. Backfilling the untested branches of every allowlisted module the same day moved the measurement to statements 100%, branches 99.51%, functions 100%, lines 100%.

The floor is **90 on all four**, deliberately below that measurement, which revises the original "baseline rounded down" rule. Rounding down only works while the baseline has slack; pinning at 100 would fail CI the moment anyone adds a partially covered file to `include` — ordinary work, not a regression — and the pressure to keep it green is exactly the padding the amendment above set out to avoid. The suite clears 100 because the repo is boilerplate-sized, not because 100 is sustainable. 90 absorbs new files and still catches a real slide. Lowering it needs a reason in the commit; raising it needs a reason to believe the headroom is no longer wanted.

To skip unreachable defensive code instead of testing it, use `/* v8 ignore next -- @preserve */` — `@preserve` is required or the oxc transform strips the comment.

**2026-08-03 — pure Zod schema modules leave the `include` allowlist.** The scope rule above already puts "plain Zod shapes" out of test scope, but they were still being *measured*, and that combination is worse than either choice alone: importing a file of `z.object({…})` executes every line, so it scores 100% statements/branches/lines while nothing asserts anything about it. `packages/core/src/apis/core.ts` had no test file at all and still reported 100%.

Mutation testing is what surfaced it — that file scored 9.09%, the worst in the repo, with survivors like `z.number().min(1)` → `.min(100)` ([ADR-0003](./0003-mutation-testing-is-advisory.md)). The fix is to stop measuring what we deliberately do not test, not to start testing it: measuring it inflates the very number the 90% floor is meant to defend.

Scope is narrow and structural: **modules that contain only schema declarations**. Files that mix schemas with functions — `apis/{auth,better-auth,cdn}.ts`, whose `authKeys`/`authRepositories` are MSW-tested per [ADR-0002](./0002-network-boundary-mocking-with-msw.md) — stay in. Their Zod-constraint mutants survive and are accepted noise, recorded as such in ADR-0003.

`coverage` is root-only (Vitest's `NonProjectOptions`), so `--project <name> --coverage` measures the global include list against a partial run and reports the other projects at 0%. There is deliberately no per-project `*:test:unit:cov`-style script despite the symmetry with the per-project ones: coverage is whole-suite only, via `bun test:unit:cov`.

**2026-08-30 — the E2E this ADR defers UI behavior to no longer runs before a merge.** [ADR-0004](./0004-e2e-is-manual.md) moved Playwright out of `ci.yml` into a `workflow_dispatch` workflow that also runs on push to `main`. It runs on no pull request.

Two clauses above now rest on something weaker than they did. The scope rule — "React components/hooks (RTL, hook harnesses) … are out of scope — UI behavior belongs in Playwright E2E" — still names the right home for UI behavior, but that home is no longer visited before code lands. And the rejected option "React Testing Library for components/hooks — rejected; duplicates E2E cost and slows the suite" was an argument about *duplication*: RTL was redundant because E2E already covered that ground on every PR. It no longer does, so the redundancy argument is spent. The rejection stands on its remaining leg only — wall-clock cost, and the preference for `environment: 'node'` over a DOM shim — which is a thinner leg than the one it was written on.

Neither clause is reversed here. **Pre-merge UI coverage is accepted as zero**, deliberately and with the alternatives enumerated in ADR-0004. This note exists so that a future reader who finds a UI regression on `main` does not conclude the scope rule failed: the scope rule assumed a gate that was removed on purpose.
