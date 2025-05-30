import { useSeoMeta } from '@unhead/react'
import { defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/react'
import { assign } from 'radashi'

type UseSeoMetaParams = Parameters<typeof useSeoMeta>[0]

const appName = '@workspace/spa'
const appDescription = 'Bulletproof React.js 19 Template'
const appBaseUrl = process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3001'
const appOgImage = '/og.png'
const appPublisher = 'Rizeki Rifandani'
const ldParams = {
  author: {
    name: appPublisher,
    url: appBaseUrl,
  },
  name: appName,
  url: appBaseUrl,
  inLanguage: ['en-US', 'id-ID'],
}

/**
 * Creates metadata for SEO optimization, social sharing, and JSON-LD script at runtime.
 *
 * @example
 * useSeo({
 *   title: 'Home | @workspace/spa',
 *   description: 'Welcome to our site',
 *   image: '/images/og-image.jpg'
 * })
 */
export function useSeo(params: UseSeoMetaParams = { title: 'Layout' }) {
  const title = `${params.title} | ${appName}`
  const description = `${params?.description ?? appDescription}`

  const defaultMetadata: typeof params = {
    title,
    description,
    // keywords: [publisher, 'rifandani.com'], // no longer recommended by Google
    appleMobileWebAppTitle: title,
    ogTitle: title,
    ogDescription: description,
    ogUrl: appBaseUrl,
    ogImage: params?.ogImage ?? appOgImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterSite: appBaseUrl,
    twitterImage: params?.ogImage ?? appOgImage,
  }

  // Merge the default metadata with any additional properties passed in
  const metadata = assign(defaultMetadata, params)

  // create SEO meta tags
  useSeoMeta(metadata)

  // create schema.org JSON-LD <script>
  useSchemaOrg([
    defineWebSite({ ...ldParams, title, description }),
    defineWebPage({ ...ldParams, title, description }),
  ])
}
