# @workspace/spa

## 🎯 Todo

- react compiler

## 📦 Prerequisite

### Environment Variables

> The source of truth is the local env files, so the process is whenever we change the local env files, we need to also update the deployment CI/CD project env

- `.env.dev.example` and `.env.prod.example` are just an example to show the available env variables, it's not used in any possible way
- if you're new, rename the `.env.dev.example` and `.env.prod.example` to `.env.dev` and `.env.prod` respectively

## 💻 Development

To run the app:

```bash
# spin up all services using docker compose (run this in root project)
bun compose:up

# run the app with development env in port 3001
bun dev

# run the app with production env in port 3001
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

Everytime we build the app, we can see the HTML report of the bundle size by checking the `html` folder.

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

After we build this full client-side app, we can deploy the static files in `dist` folder to any CDN or hosting service.

---

## 🔒 Security

Coming Soon.

> Resources:
>
> - [Security](https://web.dev/learn/privacy/welcome)

## ⚙️ Performance

Coming Soon.

> Resources:
>
> - [Capo.js](https://rviscomi.github.io/capo.js/) for enhancing the performance of HTML `<head>` by reordering it.
> - [Unlighthouse](https://unlighthouse.dev/) for measuring the performance of all pages.
> - [Web.dev Performance](https://web.dev/learn/performance/welcome)

### Web Vitals

Coming Soon

> Resources:
>
> - [Web Vitals](https://web.dev/explore/learn-core-web-vitals)

## ⌨️ Accessibility

Accessibility (a11y) is about designing and building websites and web apps that people with disabilities can interact with in a meaningful and equivalent way.
[Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/) is considered the "gold standard" for conformance testing.
The WCAG guidelines have three levels of success criteria: A (30 success criteria), AA (20 success criteria), and AAA (28 success criteria).

Coming Soon.

> Resources:
>
> - [Accessibility](https://web.dev/learn/accessibility/welcome)
> - [WCAG 2.2](https://www.w3.org/TR/WCAG22)

## 🌎 Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `useSeo` in `src/core/hooks/use-seo.ts` to generate metadata for each page at runtime in browser. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3051
bun meta
```

> Resources:
>
> - [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.

### Favicons

Favicons are small icons that represent our site in bookmarks, web browser tabs, phone home screens, and search engine results.

To regenerate your app icon assets, change the `public/favicon.svg` and run:

```bash
# this will generate the app icon assets in public folder
bun pwa-assets:gen
```

### Open Graph & Twitter Images

Open Graph (OG) images are images that represent our site in social media.

To play around with og image generation, we can visit [OG Playground](https://og-playground.vercel.app/).

### Robots.txt

A file that matches the [Robots Exclusion Standard](https://en.wikipedia.org/wiki/Robots.txt#Standard).
Used to tell search engine crawlers which URLs they can access on our site.

### Sitemap.xml

A file that matches the [Sitemaps XML format](https://www.sitemaps.org/protocol.html).
Used to help search engine crawlers index our site more efficiently.

Everytime we add a new page, we need to regenerate the `sitemap.xml` by running:

```bash
# this will regenerate the sitemap.xml in public folder
bun sitemap:gen
```

### Structured Data (Rich Results)

Structured data is a standardized format for providing information about a page and classifying the page content. Adding structured data can enable search results that are more engaging to users and might encourage them to interact more with our website, which are called **_rich results_**. Structured data uses [schema.org](https://schema.org/) vocabulary with many different encodings, including RDFa, Microdata and [JSON-LD (JavaScript Object Notation for Linked Data)](https://json-ld.org/) format.

To add structured data to a page, we can use the `useSeo` in `src/core/hooks/use-seo.ts` for each page. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page.

```tsx
import { useSeo } from '@/core/hooks/use-seo'

function Page() {
  useSeo({
    title: 'Home',
    description: 'Welcome to our React.js application. Explore our modern, feature-rich web platform with theme customization, multi-language support, and user profiles.',
  })
}
```

To play around with JSON-LD markup, visit [JSON-LD Playground](https://json-ld.org/playground/). To test if our structured data is working, we can use [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general validation.

## 🎛️ Feature Flags

We are using [OpenFeature](https://openfeature.dev/) to manage feature flags and [Flagsmith](https://flagsmith.com/) as the provider. Flagsmith can be self-hosted.

Navigate to [Flagsmith UI](http://localhost:8000/), login using your account. Create a project. Get "SDK Key" from the "development" and "production" environments. Paste it in `VITE_FLAGSMITH_ENVIRONMENT_ID` in `.env.dev` and `.env.prod`.

## 📊 Observability

You can check the traces and metrics in the Grafana dashboard.
As of now, otel in web browser does not support logs.
Use logger from `@workspace/core/utils/logger` to normally console.log.
Do not log using `diag` from `@opentelemetry/api` because we only use it for internal otel logs.

### Grafana

Run docker compose to start the [`grafana/otel-lgtm`](https://github.dev/grafana/docker-otel-lgtm/) container. This will spin up a OpenTelemetry backend including [Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/) (metrics database), [Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/) (traces database), [Loki](https://grafana.com/docs/grafana/latest/datasources/loki/) (logs database), and [Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/) (profiling database). It also spin up Grafana Dashboard for visualization at `http://localhost:3111`. If you haven't logged in, use the following credentials:

- Username: `admin`
- Password: `admin`

---

## 📱 Progressive Web App (PWA)

This app can be installed on a device and work offline.
At a high level, a PWA consists of a web app manifest to give the browser information about your app, and a service worker to manage the offline experience.

This app is using [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) to generate the web app manifest and service worker & [@vite-pwa/assets-generator](https://github.com/vite-pwa/assets-generator) to generate the icon assets.
You can check the PWA config in `vite.config.ts` and assets generator config in `pwa-assets.config.ts`.
This app using [`generateSW` strategy](https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors.html) to generate the service worker and with [`prompt` behavior](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) registration type.
The reload prompt toast component is in `src/core/providers/reload-prompt-sw.tsx`.

> Resources:
>
> - [Learn PWA](https://web.dev/learn/pwa/welcome)
> - [PWA Checklist](https://web.dev/articles/pwa-checklist)
> - [What PWA Can Do Today](https://whatpwacando.today/)
