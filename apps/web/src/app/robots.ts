import type { MetadataRoute } from 'next'

// change production url when you know
const url = new URL(
  process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3002',
)

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // disallow: '/private-page',
    },
    sitemap: `${url}sitemap.xml`,
  }
}
