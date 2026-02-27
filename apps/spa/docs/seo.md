# SEO (Search Engine Optimization)

Use `useSeo` to generate metadata for each page at runtime in browser.

```tsx
import { useSeo } from '@/core/hooks/use-seo'

function Page() {
  useSeo({
    title,
    description,
  })
}
```

## `sitemap.xml`

Everytime we add a new page, we need to update the `scripts/gen-sitemap` and regenerate the `sitemap.xml` by running:

```bash
bun sitemap:gen
```
