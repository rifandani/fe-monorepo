import { Breadcrumbs, BreadcrumbsItem } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const BreadcrumbsShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Breadcrumbs>
        <BreadcrumbsItem href="#">Home</BreadcrumbsItem>
        <BreadcrumbsItem href="#">Library</BreadcrumbsItem>
        <BreadcrumbsItem>Data</BreadcrumbsItem>
      </Breadcrumbs>
    </Variant>
  </VariantGrid>
);
