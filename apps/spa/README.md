# @workspace/spa

## 🎯 Todo

~

## 📦 Prerequisite

- Node 22+
- Bun 1.2.15+

### Environment Variables

> The source of truth is the local env files, so the process is whenever we change the local env files, we need to also update the deployment CI/CD project env

- `.env.development.example` and `.env.production.example` are just an example to show the available env variables, it's not used in any possible way
- if you're new, rename the `.env.development.example` and `.env.production.example` to `.env.development` and `.env.production` respectively

## 💻 Development

To run the app:

```bash
# run the app with development env in port 3001
$ bun dev

# run the app with production env in port 3001
$ bun dev:prod
```

## 🔨 Development Build

To build the app:

```bash
# build the app with development env
$ bun build
```

## 🔨 Production Build

To build the app:

```bash
# build the app with production env
$ bun build:prod
```

## 📊 Analyze Bundle Size

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

This app supposed to be a full client-side app. After we build the app, we can deploy the static files in `dist` folder to any hosting service.

---

## 🔒 Security

Coming Soon.

## ⚙️ Performance

Resources:

- [Capo.js](https://rviscomi.github.io/capo.js/) is a good reference for enhancing the performance of HTML `<head>` by reordering it.
- [Unlighthouse](https://unlighthouse.dev/) is a good reference for measuring the performance of all pages.

### Web Vitals

Coming Soon

## ⌨️ Accessibility

Coming Soon.

## 🌎 Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `useSeo` in `src/core/hooks/use-seo.ts` to generate metadata for each page at runtime in browser. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3051
bun meta
```

Resources:

- [Zhead](https://zhead.dev/) is a `<head>` database. Discover new tags to use to improve your SEO, accessibility and performance.

### Favicons

Favicons are small icons that represent our site in bookmarks, web browser tabs, phone home screens, and search engine results.

To regenerate your app icon assets, change the `public/favicon.svg` and run:

```bash
# this will generate the app icon assets in public folder
bun pwa:assets-gen
```

### Open Graph & Twitter Images

Open Graph (OG) images are images that represent our site in social media.

To play around with og image generation, we can visit [OG Playground](https://og-playground.vercel.app/).

### Robots.txt

A file that matches the [Robots Exclusion Standard](https://en.wikipedia.org/wiki/Robots.txt#Standard). Used to tell search engine crawlers which URLs they can access on our site.

### Sitemap.xml

A file that matches the [Sitemaps XML format](https://www.sitemaps.org/protocol.html). Used to help search engine crawlers index our site more efficiently.

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

## 📱 Progressive Web App (PWA)

Coming Soon
