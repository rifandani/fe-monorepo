# Unit tests are pure module logic only

We run Vitest projects (`core`, `spa`, `web`, `expo`) for Unit tests: utils, libs, registries, plain classes, non-React factories, and Zustand stores via `.getState()`. React components/hooks (RTL, hook harnesses), plain Zod shapes, Vitest UI, and browser mode are out of scope — UI behavior belongs in Playwright E2E. Files are `*.unit.test.ts` under `environment: 'node'` with shared polyfills; CI jobs are `core-unit`, `spa-unit`, `web-unit`, `expo-unit`.

> Coverage was originally out of scope too. That clause was reversed on 2026-07-28 — see [Amendments](#amendments).

## Considered Options

- React Testing Library for components/hooks — rejected; duplicates E2E cost and slows the suite
- happy-dom/jsdom by default — rejected; Node + targeted mocks is faster for pure logic
- Coverage gates — rejected; optimize for wall-clock speed, not % lines (partially reversed — see Amendments)

## Amendments

**2026-07-28 — coverage is in scope as a reporting tool.** Coverage *measurement* is in scope; coverage *targets* are not. The original rejection conflated them: an aspirational gate ("must hit 80%") invites padding tests and pressures contributors toward unit-testing UI, but a floor pinned to the measured baseline only detects regression. Cost is +1.4s (~29%) on the warm suite — `v8` needs no pre-instrumentation pass, `coverage.enabled` stays `false` so watch runs and the four unit jobs are untouched, and `unit-coverage` runs concurrently with them, adding no pipeline wall-clock.

Coverage measures business logic, defined by the `coverage.include` allowlist in `vitest.config.ts`. That list is a specification: a file appears in the report, covered or not, only if matched there. It holds together on one convention, named here because the codebase already practises it:

> **Logic Seam** — a framework entry point holds no logic. It delegates to a plain `.ts` sibling, and the sibling is what gets unit-tested and measured (`app/api/og/route.tsx` → `og-params.ts`).

Logic left inside a shell is therefore invisible to coverage by design — that absence is the signal to extract it. Note `.tsx` is not a proxy for UI here: `core/utils/seo.tsx` and both Zustand stores are `.tsx` business logic.

`thresholds` is a floor, not a target — `autoUpdate: false`, aggregate. First baseline 2026-07-28: statements 90.1%, branches 78.33%, functions 84.64%, lines 90.05%. Backfilling the untested branches of every allowlisted module the same day moved the measurement to statements 100%, branches 99.51%, functions 100%, lines 100%.

The floor is **90 on all four**, deliberately below that measurement, which revises the original "baseline rounded down" rule. Rounding down only works while the baseline has slack; pinning at 100 would fail CI the moment anyone adds a partially covered file to `include` — ordinary work, not a regression — and the pressure to keep it green is exactly the padding the amendment above set out to avoid. The suite clears 100 because the repo is boilerplate-sized, not because 100 is sustainable. 90 absorbs new files and still catches a real slide. Lowering it needs a reason in the commit; raising it needs a reason to believe the headroom is no longer wanted.

To skip unreachable defensive code instead of testing it, use `/* v8 ignore next -- @preserve */` — `@preserve` is required or the oxc transform strips the comment.

`coverage` is root-only (Vitest's `NonProjectOptions`), so `--project <name> --coverage` measures the global include list against a partial run and reports the other projects at 0%. There is deliberately no `web:test:unit:cov`-style script despite the symmetry with the per-project ones: coverage is whole-suite only, via `bun test:unit:cov`. The job is advisory rather than a required check until there is evidence of how often the ratchet trips on legitimate refactors.
