---
name: bump-deps
description: Bump JS deps via ncu, read majors, green the gates, hand off to commit + /release.
disable-model-invocation: true
---

# Bump deps

Leading word: **bump**. Universe is the root `bump:deps` script (Expo/RN/Tamagui stay where that script leaves them).

## 1. Apply

`bun bump:deps`, then `bun i`.

**Done when:** install succeeded and git shows `package.json` / `bun.lock` version moves.

## 2. Classify

Diff old → new versions.

- **Major** — GitHub changelog. If the package ships an upgrade blog (Next, React, Vite/Vitest, Tailwind, TypeScript), read that too. Brief breaking changes that bite *this* repo, then continue.
- **Minor** — same, but only for the **popular** set, or a package that later fails a gate: Next, React, React DOM, TypeScript, Vitest, Tailwind, Ultracite/oxlint, Better Auth.
- **Patch** — skip notes.

Next minor/major: also run `bun web bump:nextjs` (codemod).

**Done when:** every major and every popular-minor is accounted for — notes read, bites briefed, required code listed.

## 3. Adapt

Apply the required code/config from step 2.

**Replace, don’t decorate.** Adopt experimental APIs only when they retire a pattern this repo already has (workaround, TODO, or a config we already set). New knobs with no current use → mention in the report, leave off.

**Done when:** every bite has an edit, or the report says it does not apply.

## 4. Gates

Loop until all green, in parallel/subagent:

1. `bun lint-typecheck`
2. `bun test:unit:cov`
3. `bun spa build` and `bun web build`
4. `bun audit:sca`
5. `bun check:all`

**Done when:** all commands pass.

## 5. Hand off

Report: majors + popular minors, breaking changes that bite, code/config edits, experimental adoptions (and skipped knobs).

Leave the diff uncommitted. Tell the user the next step is: **check the report → commit → `/bump-ui` or `/release`**.

**Done when:** that report is delivered and that next-step line is spoken.
