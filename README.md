# fe-monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/fe-monorepo)

## 🏁 Getting Started

Open your agent and run: `/getting-started set up this repo`

## Maintenance

- /improve-codebase-architecture
- /improve-codebase-architecture to use /effect ecosystem in both expo and spa apps

## 🗒️ Notes

- We have adjusted `/tdd` skills from original Matt Pocock's
- Our custom skills are: `/bump-deps`, `/bump-ui`, `/delete-wt`, `/getting-started`, `/release`, `/settle-pr`, `/upkeep-implicit-state-machine`, `/upkeep-lint-suppressions`, `/upkeep-react-patterns`, `/upkeep-storage-space`, `/upkeep-warning-logs`, `/wt`
- Don't forget to sync local env and CI env

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
