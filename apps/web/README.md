# @workspace/web

## 🎯 Todo

- [ ] sitemap still does not work when we run `bun web build`. That's why we rename it into `sitemap.txt`.
- [ ] upgrade nextjs to v15.4

## 📦 Prerequisite

- Node >=22.17.1
- Bun 1.2.19+

### Environment Variables

> The source of truth is the local env files, so the process is whenever we change the local env files, we need to also update the deployment CI/CD project env

- `.env.dev.example` and `.env.prod.example` are just an example to show the available env variables, it's not used in any possible way
- if you're new, rename the `.env.dev.example` and `.env.prod.example` to `.env.dev` and `.env.prod` respectively

## 💻 Development

To run the app:

```bash
# spin up all services using docker compose (run this in root project)
bun compose:up

# run the app with development env in port 3002
bun dev

# run the app with production env in port 3002
bun dev:prod
```

## 🔨 Development Build

To build the app:

```bash
# build the app with development env
bun build
```

## 🔨 Production Build

To build the app:

```bash
# build the app with production env
bun build:prod
```

## 📊 Analyze Bundle Size

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

## 🚀 Deployment

Coming Soon

---

## 🔒 Security

### Content Security Policy (CSP)

Coming Soon. [Reference here](https://nextjs.org/docs/app/guides/content-security-policy)

## ⚙️ Performance

Coming Soon.

Resources:

- [Capo.js](https://rviscomi.github.io/capo.js/) is a good reference for enhancing the performance of HTML `<head>` by reordering it.
- [Unlighthouse](https://unlighthouse.dev/) is a good reference for measuring the performance of all pages.

### Web Vitals

Coming Soon

## ⌨️ Accessibility

Coming Soon. [Reference here](https://nextjs.org/docs/app/building-your-application/optimizing/accessibility)

## 🌎 Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `createMetadata` in `src/core/utils/seo.tsx` to generate metadata for each page at runtime in server. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3052
bun meta
```

Resources:

- [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.

### Favicons

Favicons are small icons that represent our site in bookmarks, web browser tabs, phone home screens, and search engine results. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).

To regenerate your app icon assets, change the `public/favicon.svg` and run:

```bash
# this will generate the app icon assets in public folder
bun pwa:assets-gen
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

> We don't execute feature flag in server, we only execute it in the browser, that's why we use the client SDK.

```bash
# spin up flagsmith self-hosted using docker compose (run this in root project)
bun compose:up
```

Navigate to [Flagsmith UI](http://localhost:8000/), login using your account. Create a project. Get "SDK Key" from the "development" and "production" environments. Paste it in `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` in `.env.development` and `.env.production`.

## 📊 How to Observability

You can check the traces, metrics, and logs in the Grafana dashboard.
Use logger from `@workspace/core/utils/logger` to normally console.log that works in browser and server.
Use logger from `@/core/utils/logger` to log telemetry data that works in server ONLY.
Do not log using `diag` from `@opentelemetry/api` because we only use it for internal otel logs.

### Grafana

Run docker compose to start the [`grafana/otel-lgtm`](https://github.dev/grafana/docker-otel-lgtm/) container. This will spin up a OpenTelemetry backend including [Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/) (metrics database), [Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/) (traces database), [Loki](https://grafana.com/docs/grafana/latest/datasources/loki/) (logs database), and [Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/) (profiling database). It also spin up Grafana Dashboard for visualization at `http://localhost:3111`. If you haven't logged in, use the following credentials:

- Username: `admin`
- Password: `admin`

```bash
# cd into root of the workspace
cd ../..

# run the docker compose file
bun compose:up
```

Then, start the dev server to start sending the metrics, and traces to otel collector.

```bash
# running in port 3002
bun web dev
```
