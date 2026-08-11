import { Loader } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const LoaderShowcase = () => (
  <VariantGrid>
    <Variant label="ring">
      <Loader aria-label="Loading" variant="ring" />
    </Variant>
    <Variant label="spin">
      <Loader aria-label="Loading" variant="spin" />
    </Variant>
  </VariantGrid>
);
