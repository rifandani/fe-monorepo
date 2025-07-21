# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

## 🎯 Todo

- [ ] `eslint-plugin-better-tailwindcss` is not working since we use `linker = "isolated"` in `bunfig.toml`
- [ ] Consider using Bun `catalog` to manage monorepo dependencies (waiting for bun updates, to support updating catalog when running `bun update --latest`)
- [ ] Consider using `@tanstack/react-form` instead of `react-hook-form` (`next-safe-action` still does not support `@tanstack/react-form`)

## 📦 Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun outdated` to check for outdated dependencies in root and run `bun update --latest` to upgrade all dependencies in root to the latest version or `bun update --interactive` to upgrade dependencies interactively
- Run `bun outdated --cwd packages/core` to check for outdated dependencies and run `bun update --latest --cwd packages/core` to upgrade all dependencies to the latest version. Make sure to also update the `peerDependencies`
- Run `bun outdated --cwd apps/web` to check for outdated dependencies and run `bun update --latest --cwd apps/web` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/spa` to check for outdated dependencies and run `bun update --latest --cwd apps/spa` to upgrade all dependencies to the latest version
- To upgrade expo app, it's better to follow the steps in "How to upgrade?" section inside it's [README](./apps/expo/README.md)
- To upgrade IntentUI components, run interactively `bunx @intentui/cli@latest add -o`
- If there's MINOR upgrade in `playwright`, run `bun web test:install` to install new version of chromium
- Run `bun web test`, `bun spa test`, and `bun expo test:dev` to run E2E tests (run the dev server / emulator first)
- Run `bun web build`, `bun spa build`, and `bun expo build:android:dev:local` to build with development env
- Run `bun lint-typecheck` for linting and type checking

After making sure all changes are checked, run `bun cs` to create a new changeset and `bun cs:v` to version the changeset.

## 📝 Environment Variables

For first timer, you need to create the 2 environments in your github repo.
First is `dev` environment, and second is `prod` environment (that's why in `.github/workflows/ci.yml` we stated `environment: dev`).
In both environments, name it `SPA_ENV_FILE` and `WEB_ENV_FILE` (that's why in `.github/workflows/ci.yml` we stated `secrets.SPA_ENV_FILE` and `secrets.WEB_ENV_FILE`).

The value for `SPA_ENV_FILE` in `dev` environment is `.env.development`, and the value for `SPA_ENV_FILE` in `prod` environment is `.env.production` for @workspace/spa.
The value for `WEB_ENV_FILE` in `dev` environment is `.env.dev`, and the value for `WEB_ENV_FILE` in `prod` environment is `.env.prod` for @workspace/web.

Everytime there is a change in the local env variables, you need to also update the env variables in the github repo.

## 📱 Apps

### @workspace/spa

[See here](./apps/spa/README.md)

### @workspace/web

[See here](./apps/web/README.md)

### @workspace/expo

[See here](./apps/expo/README.md)

## 📦 Packages

### @workspace/core

[See here](./packages/core/README.md)

### @workspace/typescript-config

[See here](./packages/typescript-config/README.md)
