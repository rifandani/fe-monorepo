# Repo setup

Use this reference for all projects. Paths are relative to the repo root.

## Identity and package history

- Set the root `package.json` `name`, `description`, `author`, and `license`.
- Set `description`, `author`, and `license` in retained `apps/*/package.json` and `packages/*/package.json`. Keep package names aligned with the chosen scope and workspace references.
- Apply the chosen version policy. If the user requests a reset, account for fixed package groups in `.changeset/config.json`. Clear old entries in `apps/*/CHANGELOG.md` and `packages/*/CHANGELOG.md` only when selected.
- Check the existing `LICENSE` against manifest license fields. Add or update it for the chosen license and preserve required attribution.

If the user changes `@workspace`, find every consumer. Include `.changeset/config.json`, root workspace scripts such as `core`, `spa`, and `expo`, dependency keys with `workspace:*` values, TypeScript `extends`, Vitest aliases, and source imports. Inspect shared alias helpers as well as `vitest.config.ts` files. Update the lockfile through the package manager.

## Repo identity outside manifests

- Change the root README title. Replace the DeepWiki badge and Mintlify destination with the user's sites, or remove those links if replacements do not exist.
- Update the Issue tracker repo in existing `AGENTS.md` or `CLAUDE.md` and any explicit repo target in `docs/agents/issue-tracker.md`. Use the files that exist.
- Change the issues links in `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml`.
- Change the report contact in `.github/SECURITY.md` and `.github/CODE_OF_CONDUCT.md`.
- Change `.gitleaks.toml` `title` and `docker/docker-compose.yml` `name`.
- Remove the template author's home-directory `Read(...)` permissions in `.claude/settings.json`, or replace them with user-supplied paths that are needed. Preserve other permissions.

## Local setup and app removal

Read the runtime and package-manager requirements from `.node-version` and `package.json`. Install dependencies if needed. Use the current prepare script to initialize Husky and other required local setup. Verify that Git uses the intended hooks path.

For an app selected for removal, inspect its dependents first. Remove its directory and references from root scripts, Changesets groups, Vitest projects and aliases, TypeScript configuration, Portless, security tooling, workflows, Docker configuration, and README links where present. Keep tooling used by the retained app. Regenerate the lockfile with the package manager and check that references to removed workspace packages are resolved.

Review all items, including those in files that have moved. Record absent optional files as not applicable and unresolved choices as pending.
