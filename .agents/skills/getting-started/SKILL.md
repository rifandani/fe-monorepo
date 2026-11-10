---
name: getting-started
description: Set up a new app from this boilerplate after a fork or clone, or continue a partial setup. Collect project choices and apply repo, SPA, Expo, and CI changes.
disable-model-invocation: true
---

# Getting started

Convert this template into the user's project through a guided conversation. Apply the selected changes and verify them. Read all paths from the repo root unless a reference states otherwise.

## 1. Inspect the starting state

Read the root agent instructions, worktree status, remotes, root and workspace manifests, and root README. Read `docs/standards/` when present. Find the apps, CI workflows, existing project identity, and previous setup changes.

Use the files as the source of truth for paths, scripts, and tool versions. Reference paths describe this template; locate moved files before changing them. Keep user edits and existing setup choices.

**Done:** You can state which apps exist, which values still belong to the template, and which choices are already known.

## 2. Collect project choices

Briefly state what you found. Ask for the next missing choice with the available question tool, or in chat. Wait for the answer before work that depends on it. Ask one topic at a time; group closely related fields. Use prior answers and offer defaults so the user can answer briefly.

Start with:

1. **Apps:** offer to keep both apps, keep SPA and remove Expo, or keep Expo and remove SPA. Identify any user work in an app before proposing its removal.
2. **Identity:** project name, description, author, target GitHub `owner/repo`, report contact, and license. A fork can have an upstream remote; confirm the destination when the remotes are unclear.
3. **Package history:** offer to keep the internal `@workspace` scope. Ask whether to keep package versions or reset them to `0.0.0` or `1.0.0`, and whether to clear template changelog entries.

Collect app-specific choices when you reach that app's reference. A user can defer a choice. Mark it as pending and continue with independent work. Keep a checklist in the conversation with each item marked done, pending, or not applicable and a reason. Use it when setup continues in a later turn.

**Done:** App selection and repo identity are known or explicitly deferred. No product name, domain, account ID, API contract, or credential has been invented.

## 3. Apply repo setup

Read [Repo setup](references/repo.md). Apply each relevant item with the collected choices. Resolve any remaining choice before its dependent edit. If an app is removed, also remove its references from scripts, workspace configuration, CI, and documentation. Keep shared packages that a retained app needs.

**Done:** Every repo setup item is done, pending, or not applicable. Retained workspace dependencies resolve to existing packages.

## 4. Set up retained apps

Read only the reference for each retained app:

- **SPA:** [SPA setup](references/spa.md). Collect branding, domains, assets, product direction, and API choices, then apply them.
- **Expo:** [Expo setup](references/expo.md). Collect app IDs, EAS account details, assets, and API choices, then apply them.

Both apps share `packages/core`. Coordinate API and locale changes across them. For a replacement API, inspect the supplied contract before changing endpoints and schemas. Offer to retain DummyJSON for local setup if the contract is not ready; record API migration as pending when requested.

**Done:** Every item for each retained app has a status. Demo content, missing assets, and unavailable API details are named in pending work.

## 5. Configure CI and external services

For a retained SPA, inspect the workflows and the root README's Environment Variables section. Configure the GitHub `dev` and `prod` environments, their `SPA_ENV_FILE` secrets, and the `SPA_TARGET_URL` repository variable for the deployed SPA URL. The SPA's local env files supply its CI values. Keep workflow paths and the README consistent with the selected apps.

Compare `.github/settings.yml` with `docs/agents/triage-labels.md`. Keep the existing labels unless the user chooses a different mapping; update both files when that mapping changes.

Prepare local configuration first. Use existing authorization for GitHub or EAS changes. If it does not cover the action, show the target repo or account and the prepared change before requesting approval. Use secure secret input or local file transfer; keep secret values out of chat and tracked files. If access is unavailable or setup is deferred, give the exact remaining action and mark it pending.

**Done:** Each required environment, secret, variable, and EAS link is verified by name and target, or is listed as pending. Secret values stay private.

## 6. Verify and hand back

Search tracked and untracked, non-ignored files for template values. This command is a starting point; also search the old names found during inspection:

```bash
git grep --untracked --exclude-standard -n -i -E 'rifandani|rizeki|tri_rizeki|fe-monorepo|bulletproof|spa\.com|expoapp|Expo App|dummyjson|emilys' \
  -- . ':!*CHANGELOG.md' ':!bun.lock' ':!skills-lock.json' ':!.agents' ':!.claude/skills' ':!.cursor/skills' ':!repos' ':!docs/adr' ':!packages/core/docs/adr'
```

Examine each match. Fix project placeholders, explain intentional references, and record unresolved values. Keep vendored source under `repos/` unchanged. Review template ADRs in `docs/adr/` and `packages/core/docs/adr/` separately: keep applicable decisions and remove others according to the user's choices. Preserve required license and attribution notices.

Run the relevant formatting, lint, type, unit, and build checks from the current package scripts. Check generated assets and workspace resolution when those change. Run browser or device checks when available and relevant; report checks that need an unavailable service or device.

**Done:** Every setup item has a status, every remaining placeholder match has a reason, and check results are recorded. Report changed areas, checks, and pending actions with file paths. State that setup is complete only when all required items are done; otherwise name what remains. Commit, push, deploy, or submit to stores only when the user's request includes that action.
