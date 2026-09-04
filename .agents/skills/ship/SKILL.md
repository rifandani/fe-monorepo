---
name: ship
description: Commit (if dirty), push, and open or refresh a PR with the repo template, Test plan, and PR Lens diagrams.
disable-model-invocation: true
argument-hint: "[commit message | PR title hint]"
---

**Ship** the current branch: commit local work when needed, push, then open or refresh a pull request a reviewer can understand before reading the diff.

## 1. Preflight

Run in parallel:

- `git status -sb`, `git branch --show-current`, `git rev-parse --abbrev-ref origin/HEAD` (fallback `main`)
- `git symbolic-ref --short HEAD` — **default-branch gate:** if current branch is `main` or `master` (or equals `origin/HEAD`’s short name), stop. Tell the user to move onto a feature branch first.
- Secrets gate: if any staged or unstaged path looks like a secret (`.env`, `.env.*`, `credentials.json`, `*secret*`, `*credentials*`), stop and list the paths. Do not stage or commit them.
- Parse `$ARGUMENTS` as an optional single string (may be empty).
- `gh --version` — note whether `gh` is ≥ 2.99 (needed for `--attach`).

**Done when:** non-default branch known, secrets clear (or stopped), args parsed, base branch known, `gh` availability known.

## 2. Commit (dirty tree only)

If `git status` is clean → skip to step 3.

Otherwise:

1. Survey staged + unstaged + untracked (exclude secret paths from step 1).
2. Stage the relevant files.
3. Commit message: `$ARGUMENTS` if set; else draft 1–2 sentences focused on **why** (repo commit style: recent `git log`). Pass via HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<message>

EOF
)"
```

**Hook reject:** fix the failure, stage the fix, run **one** successful `git commit` with the same message. Never `--no-verify`.

**Hook rewrites files and the commit succeeded:** if HEAD is this session’s commit and the branch has not been pushed with that commit, `git add` the hook’s rewrites and `git commit --amend --no-edit` once. Otherwise leavex a follow-up for the user — do not amend a pushed commit.

**Done when:** working tree clean (aside from ignored paths), or step skipped because it already was.

## 3. Diagram (PR Lens)

Call the Skill tool with `pr-lens` against this branch vs the merge base with `origin/<base>` (or the base from step 1):

1. Author `.pr-lens/graph.json` from the diff.
2. `npx @coldtea/pr-lens-cli@latest validate .pr-lens/graph.json` — fix until clean.
3. `npx @coldtea/pr-lens-cli@latest render .pr-lens/graph.json --theme dark`.
4. Pick attaches: top **architecture** view always; a **data-flow** view only when the change has a sequence worth following. Read names from `.pr-lens/manifest.json`. Do not commit `.pr-lens/`.

**Done when:** valid rendered SVGs exist and the attach set is chosen.

## 4. Push

```bash
git push -u origin HEAD
```

Never `--force` or `--force-with-lease`. On rejection, stop and report remote output.

**Done when:** branch is on `origin` at HEAD, or push failed and the user has the error.

## 5. PR body

Write `.pr-lens/body.md` from [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md):

| Section | Rule |
| --- | --- |
| **Description** | Why the change exists — the summary. Immediately after it, Markdown image(s) for each attach: `![<one-line what it shows>](.pr-lens/<file>.svg)` |
| **Test plan** | New section after Description (and diagrams): checklist of how to verify |
| **Related Issue** | `Fixes #N` only when the issue is clear from branch name, commits, or this session; else leave the template placeholder |
| **Type of change** | Check the one box that fits; delete the rest |
| **Checklist** | Leave every box unchecked |
| **Screenshots / Additional Notes** | Keep if useful; otherwise leave template stubs |

Title: `$ARGUMENTS` when the tree was already clean at step 2 and args are set; else draft from commits + diff.

**Done when:** `.pr-lens/body.md` and title are ready; every attached SVG is referenced as `![alt](path)`.

## 6. Open or refresh PR

Detect an existing PR for this head branch: `gh pr view --json number,url`.

**None — create** (only if the branch has commits not in the base; otherwise stop with status, no empty PR):

```bash
gh pr create --title "<title>" --body-file .pr-lens/body.md --attach <svg>...
```

Ready for review (not draft). Base defaults to the repo default unless `gh` requires `--base`.

**Exists — refresh:**

```bash
gh pr edit <number> --title "<title>" --body-file .pr-lens/body.md --attach <svg>...
```

If `gh` < 2.99: create/edit with `--body-file` only; say attaches need `gh` ≥ 2.99 (or publish SVGs and use pr-lens `comment`).

**Done when:** PR URL known; create or edit exited 0 (or attach limitation reported with URL still valid).

## 7. Hand off

Print: branch, commit short SHA (if step 2 ran), PR URL, which diagrams attached.

**Done when:** the user has the PR URL and attach list.

## Nothing left to ship

Clean tree, `origin` already has HEAD, no commits vs base → short status only (branch, ahead/behind, PR URL if any). Skip create.
