# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

## 🎯 Todo

- [ ] lookout for [oxlint in @antfu/eslint-config](https://github.com/antfu/eslint-config/issues/767)
- [ ] fix `eslint-plugin-better-tailwindcss` is not working since we use `linker = "isolated"` in `bunfig.toml`
- [ ] consider moving `ui` into `@workspace/ui`. This requires the UI to be bundled with tailwindcss, so we need to have 2 versions, one for SPA and one for nextjs.
- [ ] consider using Bun `catalog` to manage monorepo dependencies (waiting for bun updates, to support updating catalog when running `bun update --latest`)
- [ ] create [`AGENTS.md`](https://agents.md/) file in root dir and subpackage inside monorepo

## 📦 Prerequisite

- Node >=24.12.0
- Bun >=1.3.5

## 🛠️ Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun bump:deps` to check for outdated dependencies, then run `bun install` to install it
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

The value for `SPA_ENV_FILE` in `dev` environment is `.env.dev`, and the value for `SPA_ENV_FILE` in `prod` environment is `.env.prod` for `@workspace/spa`.
The value for `WEB_ENV_FILE` in `dev` environment is `.env.dev`, and the value for `WEB_ENV_FILE` in `prod` environment is `.env.prod` for `@workspace/web`.

Everytime there is a change in the local env variables, you need to also update the env variables in the github repo.

<!-- For first timer, you need to create 2 environments in your github repo.
Go to your Github repo -> `Settings` tabs -> `Environments` -> `New environment` -> `dev` and `prod` (that's why in `.github/workflows/ci.yml` we stated `environment: dev` and `environment: prod`).

To push our local env variables to the github repo, run:

```bash
# that's why in `.github/workflows/ci.yml` we stated `secrets.SPA_ENV_FILE` and `secrets.WEB_ENV_FILE`
gh secret set SPA_ENV_FILE -e dev -f ./apps/spa/.env.dev
gh secret set SPA_ENV_FILE -e prod -f ./apps/spa/.env.prod
gh secret set WEB_ENV_FILE -e dev -f ./apps/web/.env.dev
gh secret set WEB_ENV_FILE -e prod -f ./apps/web/.env.prod
```

Everytime there is a change in the local env variables, you need to also push those changes to the github repo by running the command above. -->

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
