---
name: bump-ui
description: Bump IntentUI via spa shadcn add, adapt, mirror to web, green the gates, hand off to commit + /release.
disable-model-invocation: true
---

# Bump UI

Leading word: **bump**. Universe is root `bump:ui` (`shadcn add @intentui/all -o -c apps/spa`), then mirror into `apps/web`.

## 1. Apply

`bun bump:ui`.

**Done when:** spa `src/core/components/ui` shows the IntentUI overwrite (git dirty under that tree).

## 2. Adapt (spa)

Apply every rule below to every touched spa UI file (and toast/globals where named). Exhaustive — skip none that match.

- Keep `'use client'` on components/hooks that had it or that the generator emitted client-only.
- Merge new toast/Toaster props into `apps/spa/src/core/providers/toast/context.tsx`; delete generated `apps/spa/src/core/components/ui/toast.tsx` if present.
- Import `react-stately` (not `@react-stately/color`).
- Import `react-aria` (not `@react-aria/i18n`).
- Rewrite `@/hooks/use-mobile` → `@/core/hooks/use-mobile`.
- Rewrite `@/hooks/use-clipboard` → `@/core/hooks/use-clipboard`.
- Copy chart `className` tokens from `chart.tsx` into `apps/spa/src/core/styles/globals.css`.
- React 19 context: render `<SomeContext value={…}>` (not `SomeContext.Provider`).
- Hoist every regex to module scope (stable reference outside components/hooks).

**Done when:** every rule is checked against every matching spa file; toast merge + chart CSS done; generated `toast.tsx` gone.

## 3. Mirror (web)

1. Overwrite `apps/web/src/core/components/ui` from `apps/spa/src/core/components/ui` (full tree replace).
2. Merge toast prop changes into `apps/web/src/core/providers/toast/context.client.tsx` (keep web theme/`"use client"` wiring); delete generated web `toast.tsx` if present.
3. Copy the same chart className tokens into `apps/web/src/core/styles/globals.css`.

**Done when:** web `ui/` matches spa `ui/`; web toast + chart CSS updated; no leftover `toast.tsx`.

## 4. Gates

Loop until all green, in parallel/subagent:

1. `bun lint-typecheck`
2. `bun test:unit:cov`
3. `bun spa build` and `bun web build`
4. `bun check:all`

**Done when:** all commands pass.

## 5. Hand off

Report: IntentUI release/version if known, adapt/mirror edits, any skipped generator noise.

Leave the diff uncommitted. Tell the user the next step is: **check the report → commit → `/release`**.

**Done when:** that report is delivered and that next-step line is spoken.
