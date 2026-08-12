import { Heading } from "@/core/components/ui/heading";

import { Variant, VariantGrid } from "../variant";

export const HeadingShowcase = () => (
  <VariantGrid>
    <Variant label="level 1">
      <Heading level={1}>Heading one</Heading>
    </Variant>
    <Variant label="level 2">
      <Heading level={2}>Heading two</Heading>
    </Variant>
    <Variant label="level 3">
      <Heading level={3}>Heading three</Heading>
    </Variant>
    <Variant label="level 4">
      <Heading level={4}>Heading four</Heading>
    </Variant>
  </VariantGrid>
);
