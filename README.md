# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

## 🎯 Todo

- [ ] always update [`AGENTS.md`](https://agents.md/) file in root dir and subpackage inside monorepo and consider it as a living document
- [ ] lookout for [oxlint in @antfu/eslint-config](https://github.com/antfu/eslint-config/issues/767)
- [ ] remove feature flag (flagsmith) related things, but before that fork this repo and create another repo so that we can still have example repo for feature flag

## 🛠️ Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun bump:deps` to check for outdated dependencies, then run `bun install` to install it
- To upgrade expo app, it's better to follow the steps in "How to upgrade?" section inside it's [README](./apps/expo/README.md)
- To upgrade IntentUI components, run interactively `bunx @intentui/cli@latest add -o` (copy changes in the props into `providers/toast/context.tsx` and remove generated `toast.tsx` file) (use `react-stately` instead of `@react-stately/color`) (use `react-aria` instead of `@react-aria/i18n`)
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

## 📚 References

### Feature Flag

We are using [OpenFeature](https://openfeature.dev/) to manage feature flags and [Flagsmith](https://flagsmith.com/) as the provider. Flagsmith can be self-hosted.

Navigate to [Flagsmith UI](http://localhost:8000/), login using your account. Create a project. Get "SDK Key" from the "development" and "production" environments. Paste it in `VITE_FLAGSMITH_ENVIRONMENT_ID` (for `apps/spa`) or `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` (for `apps/web`) in `.env.dev` and `.env.prod`.

> We don't execute feature flag in server, we only execute it in the browser, that's why we use the client SDK.

### Accessibility

- [Learn Accessibility](https://web.dev/learn/accessibility/welcome)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22)

### Observability

- [`grafana/otel-lgtm` docker](https://github.dev/grafana/docker-otel-lgtm/)
- [Grafana Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/)
- [Grafana Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/)
- [Grafana Loki](https://grafana.com/docs/grafana/latest/datasources/loki/)
- [Grafana Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/)

To check the traces and metrics in the local Grafana dashboard, run the `grafana/otel-lgtm` container. This will spin up a OpenTelemetry backend including Prometheus (metrics database), Tempo (traces database), Loki (logs database), and Pyroscope (profiling database). Login to dashboard at `http://localhost:3111` with credentials:

- Username: `admin`
- Password: `admin`

### Performance

- [Capo.js](https://rviscomi.github.io/capo.js/) enhancing the performance of HTML `<head>` by reordering it.
- [Unlighthouse](https://unlighthouse.dev/) measuring the performance of all pages.
- [Web.dev Performance](https://web.dev/learn/performance/welcome)
- [Web Vitals](https://web.dev/explore/learn-core-web-vitals)

### PWA

- [Learn PWA](https://web.dev/learn/pwa/welcome)
- [PWA Checklist](https://web.dev/articles/pwa-checklist)
- [What PWA Can Do Today](https://whatpwacando.today/)

### Security

- [web.dev](https://web.dev/learn/privacy/welcome)

### SEO

- [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.
- [Opengraph Image Playground](https://og-playground.vercel.app/).
- [JSON-LD Playground](https://json-ld.org/playground/).
- [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general structured data validation.
