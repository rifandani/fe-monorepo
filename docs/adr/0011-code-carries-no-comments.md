# Code carries no comments

> Recorded on 2026-11-20.

Source code has no comments. A comment is text that the compiler, the tests and the lint rules do not check, so it goes out of date with no signal, and agents copy it into new code. An audit of 1619 comment blocks (3317 lines; adjacent `//` lines count as one block) found four kinds:

- **Tautology** (1358 blocks): it says again what the code shows. Delete it.
- **Stale** (37 blocks): it refers to code or tools that are gone (commented-out code, Next.js, react-hook-form in the SPA). Delete it.
- **Excuse** (34 blocks): it explains why a hack is safe (`SAFETY:` casts, timing delays, workarounds for upstream bugs). The comment makes the hack look finished, and the next change copies it. Delete the comment and open an issue to fix the hack.
- **Decision Record** (190 blocks): it records a decision that is not clear from the code. Move it into an ADR, grouped by area ([ADR-0012](./0012-lint-configuration-choices.md) to [ADR-0018](./0018-core-hooks-utils-and-expo-constraints.md)).

The reason for a decision goes in an ADR. The meaning of a value goes in its name or its type. The expected behavior goes in a test. A known defect goes in an issue.

## The rule

`comments/no-comments` (`scripts/lint/oxlint-plugin-comments.ts`) is a local oxlint JS plugin. It reports every comment in a JS or TS file, except tool directives: `oxlint-disable`, `eslint-disable`, `@ts-expect-error`, `fallow-ignore`, `Stryker disable`, `@vite-ignore`, `__PURE__`, `@type {…}` in JS config files, triple-slash references and shebangs. A directive changes what a tool does, so it is code, not prose. A reason after `--` in a directive stays, because the directive needs it.

The rule does not run on `apps/*/src/components/ui/**`, because `bun bump:ui` writes those files. It does not run on CSS, which oxlint does not parse.

## The ratchet

`scripts/lint/comment-baseline.json` holds the number of comments that each file may still have. The rule fails when a file has more comments than its number (a file that is not in the list has zero). It also fails when a file has fewer, so the number must go down with the code. `bun run lint:comments` lowers each number to the current count and removes files with no comments. It never raises a number. To add a comment on purpose, change the JSON by hand, so that the change is visible in review.

## Considered Options

- **Allow JSDoc on exported API** — rejected. Most JSDoc in this repo said again what the name and the type say; the rest was a decision, which belongs in an ADR.
- **`no-warning-comments` or a regex in CI** — rejected. Neither knows the difference between a directive and prose, and neither has a per-file baseline.
- **Delete every comment at once, with no baseline** — rejected. A large change must be able to stop part way, and a new comment must fail lint from the first commit.

## Consequences

- The `javascript-testing-expert` skill (vendored from `dubzzz/fast-check`) asks for `// Arrange`, `// Act`, `// Assert` and `// Helpers` comments. In this repo, a blank line separates the three parts of a test instead.
- `anti-slop/require-safety-comment-for-type-assertion` is off: it asks for a `SAFETY:` comment on each cast, which is an Excuse. A cast still needs its `oxlint-disable-next-line typescript/no-unsafe-type-assertion` directive, and each open cast has an issue.
- An empty `catch {}` needs a body, because `no-empty` accepts a comment as the only alternative. Return a value from the `catch`, or move the `try` into a small named function.
- `/delete-comment` (`.agents/skills/delete-comment/SKILL.md`) runs this audit again.
