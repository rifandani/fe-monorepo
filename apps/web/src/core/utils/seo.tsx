import type { Metadata } from 'next'
import type { Thing } from 'schema-dts'
import { assign, uid } from 'radashi'

const applicationName = '@workspace/web'
const author = {
  name: 'Rizeki Rifandani',
  url: 'https://rifandani.com',
}
const publisher = 'Rizeki Rifandani'
const twitterHandle = '@tri_rizeki'
const appUrl = 'https://rifandani.com'

/**
 * Creates metadata for SEO optimization and social sharing.
 *
 * @returns {Metadata} The complete metadata object
 *
 * @example
 * const metadata = createMetadata({
 *   title: 'Home Page',
 *   description: 'Welcome to our site',
 *   image: '/images/og-image.jpg'
 * })
 */
export function createMetadata({
  title,
  description,
  image,
  ...properties
}: Omit<Metadata, 'description' | 'title'> & {
  title: string
  description: string
  image?: string
}) {
  const parsedTitle = `${title} | ${applicationName}`
  const ogImage = `/api/og?title=${encodeURIComponent(title)}`

  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    publisher,
    authors: author,
    creator: author.name,
    category: 'Personal Blog or Website',
    icons: '/favicon.ico',
    generator: 'Next.js',
    // keywords: [publisher, 'rifandani.com'], // no longer recommended by Google
    robots: {
      index: true, // allow all search engines to index the site
      follow: true, // allow all search engines to follow the links on the site
    },
    formatDetection: {
      telephone: true,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
      startupImage: [ogImage],
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: 'website',
      siteName: applicationName,
      locale: 'en_US',
      images: [ogImage],
      countryName: 'Indonesia',
      url: appUrl,
    },
    twitter: {
      card: 'summary_large_image',
      site: appUrl,
      siteId: twitterHandle, // should be the id for the app itself
      creator: publisher,
      creatorId: twitterHandle,
      title: parsedTitle,
      description,
      images: [ogImage],
    },
  }

  // Merge the default metadata with any additional properties passed in
  const metadata = assign(defaultMetadata, properties)

  // If an image URL was provided and OpenGraph metadata exists,
  // override the default OG image with the provided image details
  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ]
  }

  // Return the final merged metadata object
  return metadata
}

/**
 * Creates a WebSite JSON-LD object for SEO optimization and social sharing.
 */
export function createWebSite(props: {
  url: string
  title?: string
  description?: string
}): Thing {
  const defaultWebPage: Thing = {
    '@type': 'WebSite',
    '@id': `${props.url}#${uid(16)}`,
    'name': '@workspace/web',
    'inLanguage': ['en-US', 'id-ID'],
  }

  return assign(defaultWebPage, props)
}

/**
 * Creates a WebPage JSON-LD object for SEO optimization and social sharing.
 */
export function createWebPage(props: {
  url: string
  title?: string
  description?: string
}): Thing {
  const defaultWebPage: Thing = {
    '@type': 'WebPage',
    '@id': `${props.url}#${uid(16)}`,
    'name': '@workspace/web',
    'inLanguage': ['en-US', 'id-ID'],
  }

  return assign(defaultWebPage, props)
}

/**
 * designed to create fully validated Google structured data, making your content more likely to be featured in Google Search results
 * this could be a server component
 *
 * @example
 * <JsonLd graphs={[
 *   createWebSite({
 *     url: 'https://example.com',
 *     name: 'Login',
 *     description: 'Login to your account',
 *   }),
 * ]} />
 */
export function JsonLd({ graphs }: {
  graphs: Thing[]
}) {
  return (
    <script
      data-testid="schema-org-graph"
      type="application/ld+json"
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graphs,
        }),
      }}
    />
  )
}
