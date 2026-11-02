# @workspace/spa

## 🏁 Getting Started

When you start a new project from this template, change the placeholder values below. Paths are relative to `apps/spa`, unless they start with "repo root". Do the repo-level steps in the [root README](../../README.md#-getting-started) too.

### Branding and SEO

- [ ] `package.json`: `name` is also the app name. `SERVICE_NAME` in `src/core/constants/global.ts` reads it, and `appName` in `src/core/utils/seo.ts` uses it for every page title and for the OpenTelemetry service name. If you want a display name that is different from the package name, set `appName` to a string.
- [ ] `src/core/utils/seo.ts`: `appDescription`, `appPublisher`, `inLanguage`, and `ogImageWidth`/`ogImageHeight` (they must match `public/og.png`).
- [ ] `src/core/utils/seo.unit.test.ts`: the expected publisher and description.
- [ ] `index.html`: `<title>`, `description`, `application-name`, `author`/`creator`/`publisher`, `<link rel="author">`, `category`, all `og:*` tags (`og:url`, `og:site_name`, `og:country_name`, `og:image` points to `http://localhost:3001`), and all `twitter:*` tags (`@tri_rizeki`, `https://spa.com`).
- [ ] `vite.config.ts`: PWA `manifest` → `name`, `short_name`, `description`, `theme_color`, `background_color`, `shortcuts`.
- [ ] `src/sw.ts`: the fallback push notification title (`"@workspace/spa"`).
- [ ] `.env.example`: `VITE_APP_TITLE`.

### Domain, sitemap, robots

- [ ] `scripts/gen-sitemap.ts`: the production `DOMAIN` (`https://spa.com`) and the `sourceData` routes.
- [ ] `public/robots.txt`: the `Sitemap:` URL.
- [ ] `public/sitemap.xml`: generate it again with the script above.

### Local dev hostname (portless)

The local URL is `https://spa.fe-monorepo.localhost`. If you rename it, change it in all of these files:

- [ ] Repo root `portless.json`: `name` and `apps["apps/spa"].name`.
- [ ] `package.json`: the `dev` script (`portless run --name spa.fe-monorepo ...`).
- [ ] `src/core/constants/env.ts`: the `"fe-monorepo.localhost"` check.
- [ ] `.env.example` (and your local `.env.*` files): `VITE_APP_URL`, `VITE_API_BASE_URL`.
- [ ] `scripts/gen-sitemap.ts`: the dev `DOMAIN`.
- [ ] Repo root `scripts/security/zap.ts` (`LOCAL_TARGET_HINT`) and `docs/security/dast.md`.

### Assets

- [ ] `public/favicon.svg`: replace it, then generate the PWA icons again (`pwa-assets.config.ts` uses it as the source).
- [ ] `public/og.png`, `public/screenshot-wide.png`, `public/screenshot-narrow.png`.

### Backend and demo data

The template uses [DummyJSON](https://dummyjson.com) as the API.

- [ ] `.env.example`: `VITE_API_BASE_URL` for your API.
- [ ] Repo root `packages/core/src/apis/*`: change the endpoints and schemas to your API.
- [ ] `src/routes/login.tsx`: remove the `(emilyspass)` hint from the login button.
- [ ] `e2e/_base.ts`, `e2e/auth.setup.ts`, `e2e/login.spec.ts`, `playwright.config.ts`: the test user (`emilys` / `emilyspass`) and the excluded `https://dummyjson.com/auth/login` URL.

### Product and design

- [ ] Run `/impeccable init`, then `/impeccable shape` to update `PRODUCT.md` and `DESIGN.md` (they still describe the "Bulletproof React.js 19 Template"). More [here](https://impeccable.style/designing/).
- [ ] `.impeccable/design.json`: `title`.
- [ ] `src/master-design/showcases/text-field.tsx`: the `"rifandani"` input placeholder.
