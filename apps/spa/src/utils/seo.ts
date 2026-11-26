import type { useSeoMeta } from "@unhead/react";
import { assign } from "radashi";

import { env } from "@/lib/layers/env";
import { SERVICE_NAME } from "@/shared/constants/global";

export type SeoMetaInput = Parameters<typeof useSeoMeta>[0] & {
  title?: string;
  description?: string;
};

const isImagePath = <T>(image: T): image is T & string =>
  typeof image === "string";

const appName = SERVICE_NAME;
const appDescription = "Bulletproof React.js 19 Template";
const appBaseUrl = env.appUrl;
const appPublisher = "Rizeki Rifandani";

export const ldParams = {
  author: {
    name: appPublisher,
    url: appBaseUrl,
  },
  inLanguage: ["en-US", "id-ID"],
  name: appName,
  url: appBaseUrl,
};

export const resolveOgImage = (image?: string) =>
  new URL(image ?? "/og.png", appBaseUrl).href;

export const buildSeoMetadata = (params?: SeoMetaInput) => {
  const title = `${params?.title ?? "Layout"} | ${appName}`;
  const description = params?.description ?? appDescription;

  const defaultMetadata: SeoMetaInput = {
    title,
    description,
    appleMobileWebAppTitle: title,
    ogTitle: title,
    ogDescription: description,
    ogUrl: appBaseUrl,
    ogImage: resolveOgImage(),
    ogImageHeight: 441,
    ogImageWidth: 843,
  };

  const metadata = assign(defaultMetadata, params ?? { title: "Layout" });

  if (isImagePath(metadata.ogImage)) {
    metadata.ogImage = resolveOgImage(metadata.ogImage);
  }

  return { description, metadata, title };
};
