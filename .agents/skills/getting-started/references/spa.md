# SPA setup

Read this reference only when the user keeps the SPA. Paths are relative to `apps/spa` unless marked as repo root. Read the app's agent instructions before edits.

## Branding and SEO

Ask for the display name, description, publisher, language, production URL, and social links. Offer to keep the package name separate from the display name.

- `package.json`: the package name feeds `SERVICE_NAME` in `src/shared/constants/global.ts`. `src/utils/seo.ts` uses the app name for page titles and the service name for OpenTelemetry. Set a separate display name in the SEO utility if selected.
- `src/utils/seo.ts`: update `appName`, `appDescription`, `appPublisher`, `inLanguage`, and `ogImageWidth` / `ogImageHeight`. Image dimensions must match `public/og.png`.
- `src/utils/seo.unit.test.ts`: update expected publisher, description, and any other changed output.
- `index.html`: update title, description, application name, author, creator, publisher, author link, category, all `og:*` tags, and all `twitter:*` tags. Include URL, site name, country, image URL, and the template social handle. Replace the localhost OG image URL with the production asset URL.
- `vite.config.ts`: update PWA manifest `name`, `short_name`, `description`, `theme_color`, `background_color`, and `shortcuts`.
- `src/app/sw.ts`: update the fallback push notification title.
- `.env.example`: update `VITE_APP_TITLE`.

## Domains and local development

Ask for the local hostname. Offer a name derived from the chosen project name. If it changes, update all of these together:

- Repo root `portless.json`: `name` and `apps["apps/spa"].name`.
- `package.json`: the Portless name in the `dev` script.
- `src/lib/layers/env.ts`: the template localhost hostname check.
- `.env.example` and existing local `.env.*` files: `VITE_APP_URL` and `VITE_API_BASE_URL`, preserving the selected API URL.
- `scripts/gen-sitemap.ts`: the development `DOMAIN`.
- Repo root `scripts/security/zap.ts`: `LOCAL_TARGET_HINT`, and `docs/security/dast.md`.

Set the production `DOMAIN` and `sourceData` routes in `scripts/gen-sitemap.ts`. Set the `Sitemap:` URL in `public/robots.txt`. Generate `public/sitemap.xml` again using the production environment so that its URLs match the chosen public domain.

## Assets and product direction

Ask for replacement assets or their paths and for brand colors. Apply available assets; list unavailable ones as pending.

- Replace `public/favicon.svg`. Generate PWA icons again using the source and command in `pwa-assets.config.ts` and the current package scripts.
- Replace `public/og.png`, `public/screenshot-wide.png`, and `public/screenshot-narrow.png`. Check metadata and manifest dimensions against the files.
- Use the installed Impeccable `init`, then `shape` workflow with the user's product choices to update `PRODUCT.md` and `DESIGN.md`. These describe the template until updated. Read its skill for the current invocation syntax.
- Update the project title in the applicable `.impeccable/design.json` or current Impeccable config. Locate the file that exists.
- Change the template author placeholder in `src/features/master-design/showcases/text-field.tsx`.

## API and demo data

Ask whether to keep DummyJSON for now or use the user's API. For a replacement, collect the API contract and test account setup through an appropriate secure channel.

- `.env.example`: set `VITE_API_BASE_URL` and keep the selected local environment values consistent.
- Repo root `packages/core/src/lib/{auth,cdn,http}/`: inspect endpoint and schema definitions and adapt them to the API. Some modules keep HTTP behavior in files other than `api.ts`.
- `src/app/routes/login.tsx`: remove the demo password hint when replacing demo authentication.
- `e2e/_base.ts`, `e2e/auth.setup.ts`, `e2e/login.spec.ts`, and `playwright.config.ts`: update demo username/password uses and the excluded DummyJSON login URL for the chosen API.

Run the affected SEO and API tests. Check sitemap output, asset references, and the SPA build. Record any retained demo behavior in the final status.
