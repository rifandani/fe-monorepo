# @workspace/web

## Note

- we don't use `@vercel/otel` because it needs a third party service to setup (e.g. sentry, datadog, langwatch, langfuse) or a custom OpenTelemetry collector.

## Todo

- [ ] sitemap still does not work when we run `bun web:build`. That's why we rename it into `sitemap.txt`.

## Prerequisite

- Node 22+
- Bun 1.2.15+

## Performance

- [Capo.js](https://rviscomi.github.io/capo.js/) is a really good reference for enhancing the performance of HTML `<head>`.

### Web Vitals

Coming Soon

## Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `createMetadata` in `src/core/utils/seo.tsx` to generate metadata for each page. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3052
bun meta
```

### Favicons

Favicons are small icons that represent our site in bookmarks, web browser tabs, phone home screens, and search engine results. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).

### Open Graph & Twitter Images

Open Graph (OG) images are images that represent our site in social media. An example of how to generate OG images dynamically, we can hit the `GET /api/og?title=My%20Title` route. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

To play around with og image generation, we can visit [OG Playground](https://og-playground.vercel.app/).

### Robots.txt

A file that matches the [Robots Exclusion Standard](https://en.wikipedia.org/wiki/Robots.txt#Standard). Used to tell search engine crawlers which URLs they can access on our site. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots).

### Sitemap.xml

A file that matches the [Sitemaps XML format](https://www.sitemaps.org/protocol.html). Used to help search engine crawlers index our site more efficiently. [Reference here](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

### Structured Data (Rich Results)

Structured data is a standardized format for providing information about a page and classifying the page content. Adding structured data can enable search results that are more engaging to users and might encourage them to interact more with our website, which are called **_rich results_**. Structured data uses [schema.org](https://schema.org/) vocabulary with many different encodings, including RDFa, Microdata and [JSON-LD (JavaScript Object Notation for Linked Data)](https://json-ld.org/) format.

To add structured data to a page, we can use the `JsonLd` component from `src/core/utils/seo.tsx`:

```tsx
import { JsonLd } from '@/core/utils/seo'

<JsonLd code={{
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': title,
  'description': description,
}}
/>
```

To test if our structured data is working, we can use [Rich Results Test](https://search.google.com/test/rich-results) for Google or [schema.org Validator](https://validator.schema.org/) for general validation.
