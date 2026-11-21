---
name: delete-comment
description: Audit the code comments that comment-baseline.json still allows, delete them, and lower the baseline.
disable-model-invocation: true
argument-hint: "[path...]"
---

Run the comment audit of [ADR-0011](../../../docs/adr/0011-code-carries-no-comments.md) again. Each comment leaves the code; what it knew goes to the place where a tool checks it.

## 1. Scope

The files to audit are the keys of `scripts/lint/comment-baseline.json`. When `$ARGUMENTS` names paths, keep only the keys under those paths. A file outside the baseline has no comments, because lint fails on it.

Read each file in scope. A **block** is one `/* */` or `/** */` comment, or a run of `//` lines with no code between them. Tool directives (`oxlint-disable`, `@ts-expect-error`, `fallow-ignore`, `/// <reference`, `@type {…}`, shebangs) are code, not blocks: `isDirective` in `scripts/lint/comment-ratchet.ts` is the definition.

**Done when:** you have a list of every block in scope, with `file:line`.

## 2. Classify

Give each block one category. Read the code that the block describes before you decide.

- **Tautology**: the code, a name or a type already says it. Section markers, `Arrange`/`Act`/`Assert`, JSDoc that repeats a signature.
- **Stale**: it refers to code, tools or behavior that are gone. Commented-out code is Stale.
- **Excuse**: it explains why a hack is acceptable: a `SAFETY:` cast, a delay that "makes sure" something happened, a workaround for an upstream bug, a value that is silently dropped. The hack stays after the comment goes, so it needs an issue.
- **Decision Record**: it records why the code is not the obvious code, or a constraint that the code does not show, and a future reader would "fix" it without the record.

When a block is two kinds, split it: the Decision Record part goes to an ADR, the Excuse part gets an issue.

**Done when:** every block has a category, and every Excuse and Decision Record has a target (an issue group or an ADR).

## 3. Record

- **Decision Record**: add it to the ADR of its area (`docs/adr/0012` lint, `0013` test tooling, `0014` Route Tests, `0015` Session/Http/Persistence, `0016` SPA telemetry/PWA/UI, `0017` scripts, `0018` core hooks/utils/Expo). Write a new ADR only for a new area, in the format of the `domain-modeling` skill. Write in ASD-STE100 Simplified Technical English. Keep the reason; leave out what the code shows.
- **Excuse**: group the Excuses by the fix that removes them. File one GitHub issue per group with `gh issue create --label needs-triage` (see `docs/agents/issue-tracker.md`). The body lists each `file:line`, what the hack is, the comment text that excused it, and the fix. Search open issues first (`gh issue list --search`), and add to a matching issue instead of a duplicate.

**Done when:** each Decision Record is in an ADR, and each Excuse is in an issue.

## 4. Delete

Delete every block in scope. Delete the whole line when the comment is the only thing on it, and the `{` `}` around a JSX comment. Keep every directive.

Lint rules that asked for a comment need code instead:

- `no-empty` on a `catch {}`: return a value from the `catch`, or move the `try` into a small named function that returns one.
- A cast keeps its `oxlint-disable-next-line typescript/no-unsafe-type-assertion` directive; its issue tracks the removal.

**Done when:** the files in scope have no blocks.

## 5. Verify

```bash
bun run lint:comments   # lowers comment-baseline.json; it never raises a count
bun lint                # includes the type check
bun run test
```

**Done when:** all three pass, and `comment-baseline.json` no longer lists the files you emptied.

## 6. Report

Give a table of blocks and lines per category, the issues you filed (with URLs), the ADRs you changed, and the lines removed (`git diff --shortstat`). Name every file that still has comments, and why.
