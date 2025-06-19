# fe-monorepo

### Todo

- [ ] use `changeset` to manage versioning and changelogs per package/app
- [ ] Make sure CI/CD works
- [ ] Consider updating `zod` to v4 (affected libraries: `zod-form-data`). replace all `'zod'` occurences with `'zod/v4'` in the codebase
- [ ] Consider using Bun `catalog` to manage monorepo dependencies
- [ ] Consider using `@tanstack/react-form` instead of `react-hook-form` (`next-safe-action` still does not support `@tanstack/react-form`)

### Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun outdated` to check for outdated dependencies in root and run `bun update --latest` to upgrade all dependencies in root to the latest version
- Run `bun outdated --cwd packages/core` to check for outdated dependencies and run `bun update --latest --cwd packages/core` to upgrade all dependencies to the latest version. Make sure to also update the `peerDependencies`
- Run `bun outdated --cwd apps/web` to check for outdated dependencies and run `bun update --latest --cwd apps/web` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/spa` to check for outdated dependencies and run `bun update --latest --cwd apps/spa` to upgrade all dependencies to the latest version
- To upgrade expo app, it's better to follow the steps in "How to upgrade?" section inside it's [README](./apps/expo/README.md)
- To upgrade IntentUI components, run interactively `bunx @intentui/cli@beta add -o`
- If there's MINOR upgrade in `playwright`, run `bun web test:install` to install new version of chromium
- Run `bun web test`, `bun spa test`, and `bun expo test:dev` to run E2E tests (run the dev server / emulator first)
- Run `bun web build`, `bun spa build`, and `bun expo build:android:dev:local` to build with development env
- Run `bun lint-typecheck` for linting and type checking

## @workspace/spa

[See here](./apps/spa/README.md)

## @workspace/web

[See here](./apps/web/README.md)

## @workspace/expo

[See here](./apps/expo/README.md)
