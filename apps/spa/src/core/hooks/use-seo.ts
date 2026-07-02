import { useSeoMeta } from "@unhead/react";
import {
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
} from "@unhead/schema-org/react";
import { assign } from "radashi";

import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";

type UseSeoMetaParams = Parameters<typeof useSeoMeta>[0];
const appName = SERVICE_NAME;
const appDescription = "Bulletproof React.js 19 Template";
const appBaseUrl = ENV.VITE_APP_URL;
const appPublisher = "Rizeki Rifandani";
const ldParams = {
  author: {
    name: appPublisher,
    url: appBaseUrl,
  },
  inLanguage: ["en-US", "id-ID"],
  name: appName,
  url: appBaseUrl,
};
const resolveOgImage = (image?: string) =>
  new URL(image ?? "/og.png", appBaseUrl).href;
const DEFAULT_SEO_PARAMS: UseSeoMetaParams = { title: "Layout" };

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
export const useSeo = (params: UseSeoMetaParams = DEFAULT_SEO_PARAMS) => {
  const title = `${params.title} | ${appName}`;
  const description = `${params?.description ?? appDescription}`;
  const defaultMetadata: typeof params = {
    appleMobileWebAppTitle: title,
    description,
    ogDescription: description,
    ogImage: resolveOgImage(),
    ogImageHeight: 441,
    ogImageWidth: 843,
    ogTitle: title,
    ogUrl: appBaseUrl,
    title,
    twitterDescription: description,
    twitterImage: resolveOgImage(),
    twitterSite: `@${appBaseUrl}`,
    twitterTitle: title,
  };
  // Merge the default metadata with any additional properties passed in
  const metadata = assign(defaultMetadata, params);
  if (typeof metadata.ogImage === "string") {
    metadata.ogImage = resolveOgImage(metadata.ogImage);
  }
  if (typeof metadata.twitterImage === "string") {
    metadata.twitterImage = resolveOgImage(metadata.twitterImage);
  }
  // create SEO meta tags
  useSeoMeta(metadata);
  // create schema.org JSON-LD <script>
  useSchemaOrg([
    defineWebSite({ ...ldParams, description, title }),
    defineWebPage({ ...ldParams, description, title }),
  ]);
};
