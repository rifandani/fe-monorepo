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

### Schema edits carry a migration

If you change `apps/web/src/db/schema.ts`, you must also write a migration. Drizzle majors and Better Auth majors both change this file. Write the migration in the same bump.

1. Run `bun web db:gen`. It writes the `.sql` file, the snapshot, and the journal entry. Do not edit these three files yourself.
2. Write only one migration for each bump. If this bump has a migration that you did not commit, delete its `.sql` file and its snapshot, remove its entry from `_journal.json`, then run `bun web db:gen` again.
3. Drizzle cannot find a rename. It reads a rename as a drop and an add. Write this SQL yourself in the generated `.sql` file, after `--> statement-breakpoint`. If there is no schema difference, run `bun web db:gen --custom` to make an empty migration.
4. For a Better Auth major, run `bun web auth:gen`. It writes `src/db/auth-schema.ts`. Drizzle does not read that file here. Use it only as a reference: copy the changes into `schema.ts` yourself, then run `bun web db:gen` again.

If the change makes rows incorrect, correct the data in three steps: expand, backfill, then contract. First add a column that permits null values. Then fill the column. Then make the column more strict in the next migration.

For a simple fill, write an `UPDATE` statement in the migration. If the fill needs app logic, an external call, or batches, write a script at `src/db/backfills/<migration-tag>.ts`. Use `src/db/seed.ts` as the model. Make the script batched, and make sure that you can run it more than one time (for example, with `WHERE col IS NULL`). Run it with `cd apps/web && bunx dotenvx run --env-file=.env.dev -- bun <path>`, because `dotenvx` is available only in that package.

**Done when:** you did an edit for each bite, or the report tells that the bite does not apply. If you changed `schema.ts`, a second `bun web db:gen` must report no schema changes.

## 4. Gates

Loop until all green, in parallel/subagent:

1. `bun lint-typecheck`
2. `bun test:unit:cov`
3. `bun spa build` and `bun web build`
4. `bun audit:sca`
5. `bun check:all`

**Done when:** all commands pass.

## 5. Hand off

Report: majors + popular minors, breaking changes that bite, code/config edits, experimental adoptions (and skipped knobs), and any generated migration — name it, and give the run order the user still owes against a real database (`bun web db:migrate`, then a backfill script, then the contracting migration).

Leave the diff uncommitted. Tell the user the next step is: **check the report → commit → `/bump-ui` or `/release`**.

**Done when:** that report is delivered and that next-step line is spoken.
