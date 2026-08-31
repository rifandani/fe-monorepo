# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

[![Mintlify Docs]](https://rifandani-fe-monorepo.mintlify.app)

## 🎯 Todo

- [ ] `/settle-mr` skill with support of compounding knowledge for every settled/rejected PR comments
- [ ] consider moving `web` app into another repository `fs-monorepo` (fullstack monorepo) as i don't really like next.js and it's fullstack not pure client side

## 🏁 Getting Started

For new project, run `/impeccable init` then `/impeccable shape` to update PRODUCT.md and DESIGN.md. More [here](https://impeccable.style/designing/).

## 📝 Environment Variables

For first timer, you need to create the 2 environments in your github repo. First is `dev` environment, and second is `prod` environment (that's why in `.github/workflows/ci.yml` we stated `environment: dev`). In both environments, name it `SPA_ENV_FILE` and `WEB_ENV_FILE` (that's why in `.github/workflows/ci.yml` we stated `secrets.SPA_ENV_FILE` and `secrets.WEB_ENV_FILE`).

The value for `SPA_ENV_FILE` in `dev` environment is `.env.dev`, and the value for `SPA_ENV_FILE` in `prod` environment is `.env.prod` for `@workspace/spa`. The value for `WEB_ENV_FILE` in `dev` environment is `.env.dev`, and the value for `WEB_ENV_FILE` in `prod` environment is `.env.prod` for `@workspace/web`.

Source of truth is local env files. When changing them, update deployment/CI project env too.

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

Source of truth is local env files. When changing them, update deployment/CI project env too. -->

## 📱 Apps

- [@workspace/spa](./apps/spa/README.md)
- [@workspace/web](./apps/web/README.md)
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

- [web.dev](https://web.dev/learn/privacy/welcome)

### SEO

- [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.
- [Opengraph Image Playground](https://og-playground.vercel.app/).
- [JSON-LD Playground](https://json-ld.org/playground/).
- [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general structured data validation.
