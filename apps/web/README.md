# @workspace/web

## 📝 Note

- we don't use `@vercel/otel` because it needs a third party service to setup (e.g. sentry, datadog, langwatch, langfuse) or a custom OpenTelemetry collector.

## 🎯 Todo

- [ ] sitemap still does not work when we run `bun web:build`. That's why we rename it into `sitemap.txt`.

## 📦 Prerequisite

- Node 22+
- Bun 1.2.15+

## 🔒 Security

### Content Security Policy (CSP)

Coming Soon. [Reference here](https://nextjs.org/docs/app/guides/content-security-policy)

## 🚀 Performance

Resources:

- [Capo.js](https://rviscomi.github.io/capo.js/) is a good reference for enhancing the performance of HTML `<head>` by reordering it.
- [Unlighthouse](https://unlighthouse.dev/) is a good reference for measuring the performance of all pages.

### Web Vitals

Coming Soon

## Accessibility

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
