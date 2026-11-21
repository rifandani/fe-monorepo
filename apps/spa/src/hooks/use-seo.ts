import { useSeoMeta } from "@unhead/react";
import {
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
} from "@unhead/schema-org/react";

import type { SeoMetaInput } from "@/utils/seo";
import { buildSeoMetadata, ldParams } from "@/utils/seo";

export const useSeo = (params: SeoMetaInput) => {
  const { description, metadata, title } = buildSeoMetadata(params);
  useSeoMeta(metadata);
  useSchemaOrg([
    defineWebSite({ ...ldParams, description, title }),
    defineWebPage({ ...ldParams, description, title }),
  ]);
};
