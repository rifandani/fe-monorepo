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

## Open Graph & Twitter Images

To generate OG images dynamically, hit the `GET /api/og?title=My%20Title` route.

## `sitemap.xml`

TODO.
