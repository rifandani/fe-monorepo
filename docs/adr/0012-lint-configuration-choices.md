# Lint configuration choices

> Recorded on 2026-11-20 from the comments in `oxlint.config.ts` ([ADR-0011](./0011-code-carries-no-comments.md)).

`oxlint.config.ts` extends the ultracite presets (`core`, `antiSlop`, `react`, `tanstack`) and the strict Effect preset. Each change to a preset below has a reason that the config does not show.

## Presets

- The `github` and `sonarjs` JS plugins stay out. `react-doctor` stays in, including the rules that overlap the React Compiler.
- The Effect diagnostics come from the `effecttsgo` plugin. The root `prepare` script patches the `oxlint` and `oxlint-tsgolint` binaries to include it.
- `options.typeAware` runs the rules that need type information. `options.typeCheck` also reports the TypeScript compiler diagnostics, so `bun lint` replaces `tsc --noEmit`. Both need `oxlint-tsgolint`. They are set in this file because oxlint does not merge `options`, `settings` or `env` from `extends`.

## Rules turned off or changed

- `unicorn/throw-new-error` is off. Effect error classes extend a factory call (`Schema.TaggedError<Self>()(…)`). The rule reads that call as a bare `Error(…)`, and its autofix adds a `new` that breaks the class. Review enforces `new` on real errors.
- `xstate-effect/no-inline-effect` is an error. An inline `enq(() => Effect.log(...))` in an XState transition builds an Effect that never runs. Register Effect actions in `setupEffect`.
- `func-names` ignores generators. `Effect.gen(function* () {…})` and `Effect.fn("name")(function* () {…})` are the Effect idiom; the span or the binding gives the name.
- `effecttsgo/global-console-in-effect` and `effecttsgo/global-date-in-effect` are errors, although upstream keeps them off. Inside an Effect, use the `Console`, `Clock` and `DateTime` services.
- `effecttsgo/unstable-api-usage` is off. Effect 4 ships `@effect/vitest`, `@effect/atom-react` and the HTTP client as unstable modules, and the app uses them on purpose.
- `typescript/only-throw-error` allows `Redirect` and `NotFoundError` from `@tanstack/router-core`. TanStack Router redirects and returns 404 by throwing `redirect()` and `notFound()`, which are not `Error` objects.
- `react/rule-suppression` is off. Some hooks and effects disable a React Compiler or `react-hooks` rule with `oxlint-disable`. The compiler still compiles the rest of the code.
- `anti-slop/require-safety-comment-for-type-assertion` is on. Each type assertion (other than `as const`) needs a `SAFETY:` comment that states the checked invariant ([ADR-0011](./0011-code-carries-no-comments.md)).

## Overrides

- `jsx-a11y/label-has-associated-control` is off in the SPA. React Aria connects `<Label>` to its control through the context of the parent field (`TextField`, `Select`), not through `htmlFor` or nesting, so the rule reports every field.
- `anti-slop/no-module-mocking` is off in unit tests and e2e files. The logger, the toast, `web-vitals`, MMKV and the runtime layers are module singletons, so their tests mock the module. The production code does not change its shape only to inject them. Every other anti-slop rule stays on in test files.
- `anti-slop/no-unknown-parameters` is off for `packages/core/src/utils/error.ts` and `apps/spa/src/utils/telemetry.ts`. `toErrorMessage` and `toReportedError` parse a caught failure, which has no known type. They check each shape before they use it. A narrower parameter type only moves the cast to each caller.
- `apps/*/src/components/ui/**` runs no lint rule. `bun bump:ui` overwrites these shadcn/Intent UI files. `allRulesOff` collects every rule that a preset, a preset override or this config sets, and turns all of them off. The type check and the import restrictions between workspaces still apply.
- Each Fallow preset runs inside one workspace, so lint keeps imports between workspaces in the package dependency direction: apps use core, core never imports an app, and the SPA and Expo never import each other.
- `useEffect` and `useLayoutEffect` cannot be imported from `react` in `apps/spa/src/**` and `apps/expo/src/**`. Most effects in app code are not necessary ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)): derive the value during render, do the work in the event handler, use a ref callback, or use `useSyncExternalStore` for an external store. An effect that syncs with an external system goes in a shared hook in `packages/core/src/hooks`, or in an app hook in `apps/*/src/hooks/*`. `filesAllowedToUseEffectHooks` also allows `apps/spa/src/providers/*` and the generated `apps/*/src/components/ui/**`. Because an override replaces the options of a rule, `appImportOverrides` gives the allowed files the cross-app import ban again, without the effect ban.
