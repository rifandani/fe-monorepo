---
name: settle-mr
description: Settle AI bot PR review comments via gh, then compound what they taught into CLAUDE.md.
argument-hint: "PR number, branch, or GitHub PR URL"
disable-model-invocation: true
---

**Settle** each bot comment before any code changes — valid feedback applied minimally, invalid feedback rejected with evidence. Then **compound**: a settled thread that would have changed how the code was written becomes a standing rule, so the next PR starts where this one ended.

GitHub PR operations use [`gh`](https://cli.github.com/) per [`docs/agents/issue-tracker.md`](../../../docs/agents/issue-tracker.md). Review threads, replies, and resolve need GraphQL via `gh api` — see [`../gh/SKILL.md`](../gh/SKILL.md).

## 1. Pin the PR

Accept any of: PR number, branch name, or GitHub PR URL. From a URL, take the numeric id after `/pull/` (e.g. `…/pull/42` → `42`). With no argument, use the current branch (`gh pr view`).

Confirm the branch checkout matches the PR head branch (`gh pr view <n> --json headRefName,baseRefName`).

**Done when:** PR number, head branch, and base branch are known and the working tree is on the head branch.

## 2. Fetch bot threads

Pull unresolved review threads only — `gh pr view --comments` is issue-level; inline threads need GraphQL:

```bash
gh api graphql -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          path
          line
          comments(first: 100) {
            nodes {
              body
              author { login }
              path
              line
              databaseId
            }
          }
        }
      }
    }
  }
}' -f owner=OWNER -f repo=REPO -F number=<pr>
```

Resolve `OWNER`/`REPO` from `gh repo view --json nameWithOwner -q .nameWithOwner`. Paginate with `--paginate` or raise `first:` when a PR has more than 100 threads. Filter to `isResolved: false`.

Read comment bodies and diff locations — file, line, quoted hunk — not the full JSON payload. Keep each thread's GraphQL `id` (`PRRT_…`) for resolve and the first comment's `databaseId` for REST reply.

Keep threads whose author is the review bot. Match against [`bot-authors.md`](bot-authors.md) when present; otherwise treat `[bot]` suffixes and non-human-looking logins (e.g. `*bot*`, `*ai*`) as bot candidates and confirm with the user when ambiguous.

**Done when:** every unresolved bot thread is listed with thread id, comment databaseId, file/line (if any), and body summary.

## 3. Settle each thread

Work thread-by-thread. For each, read the cited code in the current branch, surrounding context, the PR diff (`gh pr diff <pr>`), and any spec/issue the PR references.

Assign exactly one **settlement** using the rubric in [`RUBRIC.md`](RUBRIC.md):

| Settlement | Meaning |
|------------|---------|
| **apply** | Bot is right; implement its suggestion (or equivalent fix) |
| **partial** | Concern is real; bot's fix is wrong — implement a better one |
| **reject** | Bot is wrong — cite why |
| **defer** | Valid but out of this PR's scope |
| **ask** | Genuinely unclear — stop and ask the user |

Do the **legwork** — trace call paths, check tests, read ADRs/`CONTEXT.md` — before assigning. A settlement without evidence is incomplete.

On a **reject**, record whether the rationale cited something already written down — an ADR, a doc, a code comment, a lint rule — or rested on intent no file states. Step 6 turns the undocumented ones into rules.

**Done when:** every thread from step 2 has a settlement and a one-line rationale tied to code or spec, and every **reject** is marked documented or undocumented.

## 4. Apply

Implement **apply** and **partial** settlements only. Match local conventions; keep diffs minimal; preserve behaviour unless fixing a real bug. Batch related threads into one change when they share a root cause.

Skip **reject**, **defer**, and **ask** threads — no code changes for those.

Run typecheck and affected tests before replying on the PR.

**Done when:** every apply/partial settlement has a corresponding code change and checks pass.

## 5. Reply and resolve

Every bot thread must be **closed on the PR** — reply, then resolve. No silent skips.

Reply on the thread (REST — use the comment's `databaseId`, not the thread id):

```bash
gh api repos/{owner}/{repo}/pulls/<pr>/comments/<databaseId>/replies -f body="<message>"
```

Resolve the thread (GraphQL — use the thread `id`, `PRRT_…`):

```bash
gh api graphql -f query='
mutation($id: ID!) {
  resolveReviewThread(input: { threadId: $id }) {
    thread { isResolved }
  }
}' -f id=<thread-id>
```

Reply before resolving, always. Match the settlement:

| Settlement | Reply must say |
|------------|----------------|
| **apply** | What changed (file/behaviour). Short is fine when the diff is obvious. |
| **partial** | Why the bot's fix was wrong or incomplete, and what you did instead. |
| **reject** | Why the feedback doesn't hold — cite code, spec, ADR, or tooling. |
| **defer** | Why it's valid but out of this PR's scope; name a follow-up if one exists. |
| **ask** | What you need from the user. **Do not resolve** — stop and wait. |

Resolve **apply** and **partial** only after the fix is on the PR (pushed, or user explicitly asked to resolve against local-only changes). Resolve **reject** and **defer** immediately after the reply.

**Done when:** every bot thread from step 2 is resolved on GitHub, except **ask** threads waiting on the user.

## 6. Compound

Turn what the PR taught into rules the next PR inherits. Full criteria, routing tables, and collision handling: [`LESSONS.md`](LESSONS.md).

Walk every **apply**, **partial**, and undocumented **reject**. Put each through the **prevention test** — *had this rule been in `CLAUDE.md` before the PR, would the code have been written differently?* Yes makes it a **lesson**; no makes it an implementation detail, and detail is dropped.

For each lesson, route it (scope, then follow the owning doc's pointer), read that file, and reconcile against what is already there — drop a duplicate, sharpen an existing line in place, escalate a contradiction.

Then present all candidates at once for approval, each as target file plus the exact text to write:

```
3 lessons from 7 threads

1. `apps/spa/docs/styling.md` — "Arbitrary Tailwind values need a token."
2. root `CLAUDE.md`, ### React hooks — sharpens "Do not add useMemo by default"
   to "Derive state at render time."
3. `apps/spa/docs/architecture.md` — CONTRADICTS "Barrels are a smell". Which stands?
```

Write only what the user approves.

**Done when:** every qualifying settlement has been through the prevention test, each lesson is written to its routed file or explicitly declined, and no lesson contradicts a rule left standing.

## 7. Report

Summarize for the user: settlement counts, files changed, lessons written, threads still open. If the user asked to commit or push, do so; otherwise stop after local fixes.

**Done when:** summary delivered, every bot thread is resolved on GitHub or explicitly blocked on **ask**, and no thread lacks a settlement.
