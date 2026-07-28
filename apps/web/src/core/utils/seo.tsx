/* oxlint-disable react-doctor/only-export-components react/no-danger */
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
interface MetadataParts {
  parsedTitle: string;
  description: string;
  ogImage: string;
}

const buildOpenGraph = ({
  parsedTitle,
  description,
  ogImage,
}: MetadataParts): Metadata["openGraph"] => ({
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
});

const buildTwitter = ({
  parsedTitle,
  description,
  ogImage,
}: MetadataParts): Metadata["twitter"] => ({
  card: "summary_large_image",
  creator: publisher,
  creatorId: twitterHandle,
  description,
  images: [ogImage],
  site: `@${appUrl}`,
  siteId: twitterHandle, // should be the id for the app itself
  title: parsedTitle,
});

const buildDefaultMetadata = (parts: MetadataParts): Metadata => {
  const { parsedTitle, description, ogImage } = parts;
  return {
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
    openGraph: buildOpenGraph(parts),
    twitter: buildTwitter(parts),
  };
};

export const createMetadata = ({
  title,
  description,
  image,
  ...properties
}: Omit<Metadata, "description" | "title"> & {
  title: string;
  description: string;
  image?: string;
}) => {
  const parsedTitle = `${title} | ${applicationName}`;
  const ogImage = `/api/og?title=${encodeURIComponent(title)}`;
  // Merge the default metadata with any additional properties passed in
  const metadata = assign(
    buildDefaultMetadata({ description, ogImage, parsedTitle }),
    properties
  );
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
};
export const createWebSite = (props: {
  url: string;
  title?: string;
  description?: string;
}): WebSite => {
  const defaultWebSite: WebSite = {
    "@id": `${props.url}#${uid(16)}`,
    "@type": "WebSite",
    inLanguage: ["en-US", "id-ID"],
    name: "@workspace/web",
  };
  return assign(defaultWebSite, props);
};
export const createWebPage = (props: {
  url: string;
  title?: string;
  description?: string;
}): WebPage => {
  const defaultWebPage: WebPage = {
    "@id": `${props.url}#${uid(16)}`,
    "@type": "WebPage",
    inLanguage: ["en-US", "id-ID"],
    name: "@workspace/web",
  };
  return assign(defaultWebPage, props);
};
/**
 * `JSON.stringify` leaves `<`, `>` and the U+2028/U+2029 line separators raw,
 * so a graph value containing `</script>` would break out of the tag. Escaping
 * them as JSON string escapes keeps the payload byte-identical after parsing.
 */
const JSON_LD_UNSAFE = /[<>\u2028\u2029]/gu;
const JSON_LD_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/** Serialize a JSON-LD payload safely for embedding in an inline `<script>`. */
const serializeJsonLd = (payload: Graph): string =>
  JSON.stringify(payload).replace(
    JSON_LD_UNSAFE,
    (char) => JSON_LD_ESCAPES[char] ?? char
  );

export const JsonLd = ({ graphs }: { graphs: readonly Thing[] }) => {
  const payload: Graph = {
    "@context": "https://schema.org",
    "@graph": graphs,
  };
  return (
    <script
      data-testid="schema-org-graph"
      type="application/ld+json"
      // fallow-ignore-next-line security-sink -- serializeJsonLd escapes <, > and U+2028/U+2029; covered by seo.unit.test.ts
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(payload),
      }}
    />
  );
};
