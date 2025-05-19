# Frontend React Monorepo

### Todo

- [ ] Make sure CI/CD works
- [ ] Consider using changesets for monorepo versioning

### Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun outdated` to check for outdated dependencies in root and run `bun upgrade --latest` to upgrade all dependencies in root to the latest version
- Run `bun outdated --cwd packages/core` to check for outdated dependencies and run `bun upgrade --latest --cwd packages/core` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/web` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/web` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/spa` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/spa` to upgrade all dependencies to the latest version
- To upgrade expo app, it's better to follow the steps in "How to upgrade?" section below
- If there's MINOR upgrade in `playwright`, run `bun spa:test:install` to install new version of chromium
- Run `bun web:test` and `bun spa:test` to tests (expo is not ready yet)
- Run `bun web:build` and `bun spa:build` to build (expo is not ready yet)
- Run `bun lint-typecheck` for regression

## @workspace/web

### Note

- we don't use `@vercel/otel` because it needs a third party service to setup (e.g. sentry, datadog, langwatch, langfuse)

### Todo

- [ ] sitemap.txt still does not work when we run `bun web:build`

## @workspac/expo

[See here](./apps/expo/README.md)
