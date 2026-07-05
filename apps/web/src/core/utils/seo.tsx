/* oxlint-disable eslint/func-style -- function declarations */
import type { Metadata } from "next";
import { assign, uid } from "radashi";
import type { Graph, Thing, WebPage, WebSite } from "schema-dts";

import { ENV } from "@/core/constants/env";

const applicationName = ENV.NEXT_PUBLIC_APP_TITLE;
const author = {
  name: "Rizeki Rifandani",
  url: "https://web.com",
} satisfies Metadata["authors"];
const publisher = "Rizeki Rifandani";
const twitterHandle = "@tri_rizeki";
const appUrl = ENV.NEXT_PUBLIC_APP_URL;
export function createMetadata({
  title,
  description,
  image,
  ...properties
}: Omit<Metadata, "description" | "title"> & {
  title: string;
  description: string;
  image?: string;
}) {
  const parsedTitle = `${title} | ${applicationName}`;
  const ogImage = `/api/og?title=${encodeURIComponent(title)}`;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    publisher,
    authors: author,
    creator: author.name,
    category: "Personal Blog or Website",
    icons: "/favicon.ico",
    generator: "Next.js",
    // keywords: [publisher, 'web.com'], // no longer recommended by Google
    robots: {
      follow: true, // allow all search engines to follow the links on the site
      index: true, // allow all search engines to index the site
    },
    formatDetection: {
      telephone: true,
    },
    appleWebApp: {
      capable: true,
      startupImage: [ogImage],
      statusBarStyle: "default",
      title: parsedTitle,
    },
    openGraph: {
      countryName: "Indonesia",
      description,
      images: [
        {
          alt: parsedTitle,
          height: 441,
          url: ogImage,
          width: 843,
        },
      ],
      locale: "en_US",
      siteName: applicationName,
      title: parsedTitle,
      type: "website",
      url: appUrl,
    },
    twitter: {
      card: "summary_large_image",
      creator: publisher,
      creatorId: twitterHandle,
      description,
      images: [ogImage],
      site: `@${appUrl}`,
      siteId: twitterHandle, // should be the id for the app itself
      title: parsedTitle,
    },
  };
  // Merge the default metadata with any additional properties passed in
  const metadata = assign(defaultMetadata, properties);
  // If an image URL was provided and OpenGraph metadata exists,
  // override the default OG image with the provided image details
  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
  }
  // Return the final merged metadata object
  return metadata as Metadata;
}
export function createWebSite(props: {
  url: string;
  title?: string;
  description?: string;
}): WebSite {
  const defaultWebSite: WebSite = {
    "@id": `${props.url}#${uid(16)}`,
    "@type": "WebSite",
    inLanguage: ["en-US", "id-ID"],
    name: "@workspace/web",
  };
  return assign(defaultWebSite, props);
}
export function createWebPage(props: {
  url: string;
  title?: string;
  description?: string;
}): WebPage {
  const defaultWebPage: WebPage = {
    "@id": `${props.url}#${uid(16)}`,
    "@type": "WebPage",
    inLanguage: ["en-US", "id-ID"],
    name: "@workspace/web",
  };
  return assign(defaultWebPage, props);
}
export function JsonLd({ graphs }: { graphs: readonly Thing[] }) {
  const payload: Graph = {
    "@context": "https://schema.org",
    "@graph": graphs,
  };
  return (
    <script
      data-testid="schema-org-graph"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload),
      }}
    />
  );
}
