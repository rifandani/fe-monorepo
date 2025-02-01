import type { Metadata } from 'next'
import { assign } from 'radashi'

type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  title: string
  description: string
  image?: string
}

const applicationName = '@workspace/web'
const author = {
  name: 'Rizeki Rifandani',
  url: 'https://github.com/rifandani',
}
const publisher = 'Rizeki Rifandani'
const twitterHandle = '@tri_rizeki'

export function createMetadata({
  title,
  description,
  image,
  ...properties
}: MetadataGenerator) {
  const parsedTitle = `${title} | ${applicationName}`
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    authors: author,
    creator: author.name,
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: 'website',
      siteName: applicationName,
      locale: 'en_US',
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
    publisher,
    twitter: {
      card: 'summary_large_image',
      creator: twitterHandle,
    },
    icons: '/favicon.ico',
  }

  const metadata = assign(defaultMetadata, properties)

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

  return metadata
}
