import type { useSeoMeta } from "@unhead/react";
import { assign } from "radashi";

import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";

export type SeoMetaInput = Parameters<typeof useSeoMeta>[0];

const appName = SERVICE_NAME;
const appDescription = "Bulletproof React.js 19 Template";
const appBaseUrl = ENV.VITE_APP_URL;
const appPublisher = "Rizeki Rifandani";

/**
 * Shared schema.org fields for both the WebSite and WebPage nodes.
 */
export const ldParams = {
  author: {
    name: appPublisher,
    url: appBaseUrl,
  },
  inLanguage: ["en-US", "id-ID"],
  name: appName,
  url: appBaseUrl,
};

/**
 * Absolutize an OG/Twitter image path against the app origin.
 */
export const resolveOgImage = (image?: string) =>
  new URL(image ?? "/og.png", appBaseUrl).href;

/**
 * The whole of `useSeo`'s decision-making: apply the defaults, merge the
 * caller's overrides on top, and absolutize any image the caller supplied.
 *
 * Pure by design so the hook that wraps it is a two-line adapter over
 * `useSeoMeta`/`useSchemaOrg` — see the Logic Seam convention in
 * `docs/adr/0001-unit-tests-are-pure-module-logic.md`.
 */
export const buildSeoMetadata = (params: SeoMetaInput) => {
  const title = `${params?.title ?? "Layout"} | ${appName}`;
  const description = `${params?.description ?? appDescription}`;
  const defaultMetadata: SeoMetaInput = {
    title,
    description,
    // keywords: [publisher, 'spa.com'], // no longer recommended by Google
    appleMobileWebAppTitle: title,
    ogTitle: title,
    ogDescription: description,
    ogUrl: appBaseUrl,
    ogImage: resolveOgImage(),
    ogImageHeight: 441,
    ogImageWidth: 843,
    twitterTitle: title,
    twitterDescription: description,
    twitterSite: `@${appBaseUrl}`,
    twitterImage: resolveOgImage(),
  };
  // Merge the default metadata with any additional properties passed in
  const metadata = assign(defaultMetadata, params ?? { title: "Layout" });
  // Only the plain-string form is a path we can absolutize; unhead also accepts
  // an object/array form, which is already fully specified by the caller.
  if (typeof metadata.ogImage === "string") {
    metadata.ogImage = resolveOgImage(metadata.ogImage);
  }
  if (typeof metadata.twitterImage === "string") {
    metadata.twitterImage = resolveOgImage(metadata.twitterImage);
  }
  return { description, metadata, title };
};
