# @workspace/spa

## 🎯 Todo

- [ ] Use i18n implementation from scratch based on [Kyle youtube](https://www.youtube.com/watch?v=VbZVx13b2oY&t=1160s)
- [ ] Add sitemap.xml

## 📦 Prerequisite

- Node 22+
- Bun 1.2.15+

## 🔒 Security

Coming Soon.

## 🚀 Performance

- [Capo.js](https://rviscomi.github.io/capo.js/) is a really good reference for enhancing the performance of HTML `<head>` by reordering it.

### Web Vitals

Coming Soon

## Accessibility

Coming Soon.

## 🌎 Metadata ~ SEO (Search Engine Optimization) & GEO (Generative Engine Optimization)

Use `useSeo` in `src/core/hooks/use-seo.ts` to generate metadata for each page at runtime in browser. Make sure to adjust minimum the `title` and `description` to match the page content every time we add a new page. To check our overall site metadata:

```bash
# run check-site-meta in port 3051
bun meta
```

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
