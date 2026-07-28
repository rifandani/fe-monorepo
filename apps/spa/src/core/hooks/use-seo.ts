import { useSeoMeta } from "@unhead/react";
import {
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
} from "@unhead/schema-org/react";

import type { SeoMetaInput } from "@/core/utils/seo";
import { buildSeoMetadata, ldParams } from "@/core/utils/seo";

export const useSeo = (params: SeoMetaInput) => {
  const { description, metadata, title } = buildSeoMetadata(params);
  // create SEO meta tags
  useSeoMeta(metadata);
  // create schema.org JSON-LD <script>
  useSchemaOrg([
    defineWebSite({ ...ldParams, description, title }),
    defineWebPage({ ...ldParams, description, title }),
  ]);
};
