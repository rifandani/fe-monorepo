# @workspace/web

## 🎯 Todo

- [ ] sitemap still does not work when we run `bun web build`. That's why we rename it into `sitemap.txt`.
- [ ] fix e2e tests
- [ ] make this as fullstack template instead of just frontend-only template

## 📦 Prerequisite

### Environment Variables

> The source of truth is the local env files, so the process is whenever we change the local env files, we need to also update the deployment CI/CD project env

- `.env.dev.example` and `.env.prod.example` are just an example to show the available env variables, it's not used in any possible way
- if you're new, rename the `.env.dev.example` and `.env.prod.example` to `.env.dev` and `.env.prod` respectively

## 💻 Development

To run the app:

```bash
# spin up all services using docker compose (run this in root project)
# services includes: grafana otel for observability, flagsmith for feature flags.
bun compose:up

# run the app with development env in port 3002
bun dev

# run the app with production env in port 3002
bun dev:prod
```

## 🔨 Build

```bash
# build the app with development env
bun build
```

```bash
# build the app with production env
bun build:prod
```

### Analyze Build Bundle Size

To analyze the production bundle size:

```bash
# analyze Javascript bundle size mimicking the production build
# this will open 3 new tabs on the browser, one for nodejs build, one for edge build, and one for browser build
# the html report will be saved in the `.next/analyze` folder
bun build:prod:analyze
```

[Best practices for reducing bundle size](https://nextjs.org/docs/app/guides/package-bundling)

## 🧪 Testing

End to end testing is done with playwright. If you're new, you should install the required browsers first.

```bash
# install the required browsers
bun test:install
```

To help us write and debug playwright tests better, we can open playwright UI mode.

```bash
# open playwright UI mode
bun test:ui
```

To run the test in terminal:

```bash
# run the test in terminal
bun test

# run the test in CI with sharding
bun test:ci
```

To show the test report:

```bash
# show the test report
bun test:report
```

As of now, we can't test in CI because in order to do that we need to be able to mock the authentication response when we call auth api on the server-side (RSC and server actions).
But, `next.onFetch` from `next/experimental/testmode/playwright` only intercepts external `fetch` requests (for both client and server).
For example, if you `fetch` a relative URL (e.g. `/api/hello`) from the client that's handled by a Next.js route handler (e.g. `app/api/hello/route.ts`), it won't be intercepted.

That's why currently we test only on local with a local database.

## 🚀 Deployment

Coming Soon

---

## 🔒 Security

Coming Soon.

> Resources:
>
> - [Security](https://web.dev/learn/privacy/welcome)

### Content Security Policy (CSP)

Coming Soon.

> Resources:
>
> - [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)

## ⚙️ Performance

Coming Soon.

> Resources:
>
> - [Capo.js](https://rviscomi.github.io/capo.js/) for enhancing the performance of HTML `<head>` by reordering it.
> - [Unlighthouse](https://unlighthouse.dev/) for measuring the performance of all pages.

### Web Vitals

Coming Soon

## ⌨️ Accessibility

Accessibility (a11y) is about designing and building websites and web apps that people with disabilities can interact with in a meaningful and equivalent way.
[Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/) is considered the "gold standard" for conformance testing.
The WCAG guidelines have three levels of success criteria: A (30 success criteria), AA (20 success criteria), and AAA (28 success criteria).

Coming Soon.

> Resources:
>
> - [Next.js Accessibility](https://nextjs.org/docs/app/building-your-application/optimizing/accessibility)
> - [Web.dev Accessibility](https://web.dev/learn/accessibility/welcome)
> - [WCAG 2.2](https://www.w3.org/TR/WCAG22)

## 🌎 Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `createMetadata` in `src/core/utils/seo.tsx` to generate metadata for each page at runtime in server. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3052
bun meta
```

> Resources:
>
> - [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.

### Favicons

Favicons are small icons that represent our site in bookmarks, web browser tabs, phone home screens, and search engine results. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).

To regenerate your app icon assets, change the `public/favicon.svg` and run:

```bash
# this will generate the app icon assets in public folder
bun pwa-assets:gen
```

### Open Graph & Twitter Images

Open Graph (OG) images are images that represent our site in social media. An example of how to generate OG images dynamically, we can hit the `GET /api/og?title=My%20Title` route. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

To play around with og image generation, we can visit [OG Playground](https://og-playground.vercel.app/).

### Robots.txt

A file that matches the [Robots Exclusion Standard](https://en.wikipedia.org/wiki/Robots.txt#Standard). Used to tell search engine crawlers which URLs they can access on our site. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots).

### Sitemap.xml

A file that matches the [Sitemaps XML format](https://www.sitemaps.org/protocol.html). Used to help search engine crawlers index our site more efficiently. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

### Structured Data (Rich Results)

Structured data is a standardized format for providing information about a page and classifying the page content. Adding structured data can enable search results that are more engaging to users and might encourage them to interact more with our website, which are called **_rich results_**. Structured data uses [schema.org](https://schema.org/) vocabulary with many different encodings, including RDFa, Microdata and [JSON-LD (JavaScript Object Notation for Linked Data)](https://json-ld.org/) format.

To add structured data to a page, we can use the `JsonLd` component from `src/core/utils/seo.tsx` for each page. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page.

```tsx
import { JsonLd } from '@/core/utils/seo'

const ldParams = {
  url: process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3002',
  title,
  description,
}

function Page() {
  return (
    <JsonLd
      graphs={[
        createWebSite(ldParams),
        createWebPage(ldParams),
      ]}
    />
  )
}
```

To play around with JSON-LD markup, visit [JSON-LD Playground](https://json-ld.org/playground/). To test if our structured data is working, we can use [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general validation.

## 🎛️ Feature Flags

We are using [OpenFeature](https://openfeature.dev/) to manage feature flags and [Flagsmith](https://flagsmith.com/) as the provider. Flagsmith can be self-hosted.

Navigate to [Flagsmith UI](http://localhost:8000/), login using your account. Create a project. Get "SDK Key" from the "development" and "production" environments. Paste it in `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` in `.env.dev` and `.env.prod`.

> We don't execute feature flag in server, we only execute it in the browser, that's why we use the client SDK.

## 📊 Observability

You can check the traces, metrics, and logs in the Grafana dashboard.
Use logger from `@workspace/core/utils/logger` to normally console.log that works in browser and server.
Use logger from `@/core/utils/logger` to log telemetry data that works in server ONLY.
Do not log using `diag` from `@opentelemetry/api` because we only use it for internal otel logs.
Instrumented for server-side only.

### Grafana

Run docker compose to start the [`grafana/otel-lgtm`](https://github.dev/grafana/docker-otel-lgtm/) container. This will spin up a OpenTelemetry backend including [Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/) (metrics database), [Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/) (traces database), [Loki](https://grafana.com/docs/grafana/latest/datasources/loki/) (logs database), and [Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/) (profiling database). It also spin up Grafana Dashboard for visualization at `http://localhost:3111`. If you haven't logged in, use the following credentials:

- Username: `admin`
- Password: `admin`

---

## 🗃️ Database

We use `postgres@17` as RDBMS, `drizzle` as ORM, and `node-postgres` as driver.

Config file for drizzle-kit is in `./drizzle.config.ts`. Entry file for drizzle-orm is in `./src/db/index.ts`. Migration files are in `./src/db/migrations` folder.

Follow below conventions:

- use `snake_case` for table and column names
- for every changes in database schema, create a new migration by running `bun hono db:gen` and apply it by running `bun web db:migrate`
- commit migration files to git

### Database Migrations

You can directly apply changes to your database using the drizzle-kit push command. This is a convenient method for quickly testing new schema designs or modifications in a local development environment, allowing for rapid iterations without the need to manage migration files. This is designed to cover code first approach of Drizzle migrations.

```bash
# directly apply changes to your database
bun web db:push
```

Alternatively, you can generate the migrations first, then run the migrations.

```bash
# generate the migrations
bun web db:gen

# run the migrations
bun web db:migrate
```

We could also pull(introspect) our existing database schema and generate `schema.ts` drizzle schema file from it. This is designed to cover database first approach of Drizzle migrations. This is a great approach if we need to manage database schema outside of our TypeScript project or we're using database, which is managed by somebody else.

```bash
# pull the latest schema from the database
bun web db:pull
```

### Database Seeding

Coming Soon

### Database Studio

```bash
# run the drizzle studio at https://local.drizzle.studio?port=3003
bun web db:studio
```

## 🔐 Auth

We use `better-auth` for authentication.

```bash
# everytime we add/remove/change auth schema, generate the new auth schema
bun hono auth:gen

# generate drizzle migrations
bun hono db:gen

# run drizzle migrations
bun hono db:migrate
```

To see the openapi reference, visit `http://localhost:3002/api/auth/reference`.
