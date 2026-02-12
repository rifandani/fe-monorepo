# Metadata: SEO (Search Engine Optimization)

Use `createMetadata` or `JsonLd` component to generate metadata for each page at runtime in server.

```tsx
import { JsonLd } from '@/core/utils/seo'

export const metadata = createMetadata({
  title,
  description,
})

const ldParams = {
  url: process.env.NODE_ENV === 'production' ? PROD_APP_URL : DEV_APP_URL,
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

Make sure `title` and `description` matches the page content.

## Favicons

To regenerate app icon assets, change the `public/favicon.svg` and run:

```bash
bun pwa-assets:gen
```

Full reference in [Next.js App Icons](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).

## Open Graph & Twitter Images

To generate OG images dynamically, hit the `GET /api/og?title=My%20Title` route.

Full reference in [Next.js Opengraph Image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

## `robots.txt`

Full reference in [Next.js `robots.txt`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

## `sitemap.xml`

Not implemented yet. TODO.
