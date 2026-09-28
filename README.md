# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

[![Mintlify Docs](https://img.shields.io/badge/mintlify-docs-green?logo=mintlify)](https://rifandani-fe-monorepo.mintlify.app)

## 🏁 Getting Started

This repo is a boilerplate. When you start a new project from it, do the steps below. Each step names the files that contain placeholder values.

### 1. Repo identity

- [ ] `package.json` (root): `name`, `description`, `author`.
- [ ] `apps/*/package.json` and `packages/*/package.json`: `description`, `author`, `license`. Set `version` back to `0.0.0` or `1.0.0` if you want a fresh start.
- [ ] `apps/*/CHANGELOG.md` and `packages/*/CHANGELOG.md`: delete the old entries.
- [ ] The `@workspace/*` package scope is internal. You can keep it. If you change it, also change `.changeset/config.json`, the root `package.json` scripts (`core`, `spa`, `expo`), every `workspace:*` dependency, every `tsconfig.json` `extends`, the `@workspace/core` alias in each `vitest.config.ts`, and all imports.
- [ ] `README.md`: title, DeepWiki badge and Mintlify link (they point to `rifandani/fe-monorepo`).
- [ ] `CLAUDE.md`: the GitHub repo in the "Issue tracker" section.
- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml`: the issues link (points to `rifandani/fe-monorepo`).
- [ ] `.github/SECURITY.md` and `.github/CODE_OF_CONDUCT.md`: the contact for reports.
- [ ] `.gitleaks.toml`: `title`.
- [ ] `docker/docker-compose.yml`: `name`.
- [ ] `.claude/settings.json`: remove the `Read(//Users/rizeki.rifandani/...)` permissions, or change them to your home folder.
- [ ] Add a `LICENSE` file that agrees with the `license` field in each `package.json`.

### 2. Apps

Each app has its own "Getting Started" checklist. Do the steps for the apps that you keep, and delete the apps that you do not need.

- [ ] [`@workspace/spa`](./apps/spa/README.md#-getting-started)
- [ ] [`@workspace/expo`](./apps/expo/README.md#-getting-started)

### 3. GitHub and CI

- [ ] Create the `dev` and `prod` environments and the `SPA_ENV_FILE` secret. See [Environment Variables](#-environment-variables).
- [ ] Set the `SPA_TARGET_URL` repository variable to your deployed SPA URL (`.github/workflows/dast.yml` uses it).
- [ ] `.github/settings.yml`: change the labels if your triage labels are different (see `docs/agents/triage-labels.md`).

### 4. Check that nothing is left

Run this from the repo root. Each result is a placeholder that you must examine (the README files also match until you rewrite them):

```bash
git grep -n -i -E 'rifandani|rizeki|tri_rizeki|fe-monorepo|bulletproof|spa\.com|expoapp|Expo App|dummyjson|emilys' \
  -- ':!*CHANGELOG.md' ':!bun.lock' ':!skills-lock.json' ':!.agents' ':!.claude/skills' ':!.cursor/skills' ':!docs/adr'
```

The ADRs in `docs/adr/` and `packages/core/docs/adr/` record past decisions of this template. Keep the ones that still apply to your project and delete the others.

## 📝 Environment Variables

For first timer, you need to create the 2 environments in your github repo. First is `dev` environment, and second is `prod` environment (that's why in `.github/workflows/ci.yml` we stated `environment: dev`). In both environments, name it `SPA_ENV_FILE` (that's why in `.github/workflows/ci.yml` we stated `secrets.SPA_ENV_FILE`).

The value for `SPA_ENV_FILE` in `dev` environment is the content of `apps/spa/.env.local`, and the value for `SPA_ENV_FILE` in `prod` environment is the content of `apps/spa/.env.prod`. CI writes the secret to `apps/spa/.env.local`. If the secret is empty, CI copies `apps/spa/.env.example` to `apps/spa/.env.local`.

Source of truth is local env files. When changing them, update deployment/CI project env too.

<!-- For first timer, you need to create 2 environments in your github repo.
Go to your Github repo -> `Settings` tabs -> `Environments` -> `New environment` -> `dev` and `prod` (that's why in `.github/workflows/ci.yml` we stated `environment: dev` and `environment: prod`).

To push our local env variables to the github repo, run:

```bash
# that's why in `.github/workflows/ci.yml` we stated `secrets.SPA_ENV_FILE`
gh secret set SPA_ENV_FILE -e dev < ./apps/spa/.env.local
gh secret set SPA_ENV_FILE -e prod < ./apps/spa/.env.prod
```

Source of truth is local env files. When changing them, update deployment/CI project env too. -->

## 🗒️ Notes

- We have adjusted `/tdd` skills from original Matt Pocock's

## 📱 Apps

- [@workspace/spa](./apps/spa/README.md)
- [@workspace/expo](./apps/expo/README.md)

## 📦 Packages

- [@workspace/core](./packages/core/README.md)
- [@workspace/typescript-config](./packages/typescript-config/README.md)

## 📚 References

### Accessibility

- [Learn Accessibility](https://web.dev/learn/accessibility/welcome)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22)

### Observability

- [`grafana/otel-lgtm` docker](https://github.dev/grafana/docker-otel-lgtm/)
- [Grafana Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/) for metrics
- [Grafana Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/) for traces
- [Grafana Loki](https://grafana.com/docs/grafana/latest/datasources/loki/) for logs
- [Grafana Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/) for profiling

Login to dashboard at `http://localhost:3111` with credentials:

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

- [DAST (OWASP ZAP)](./docs/security/dast.md) |
- [web.dev](https://web.dev/learn/privacy/welcome)

### SEO

- [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.
- [Opengraph Image Playground](https://og-playground.vercel.app/).
- [JSON-LD Playground](https://json-ld.org/playground/).
- [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general structured data validation.
