import { Link } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const LinkShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Link href="#">Documentation</Link>
    </Variant>
  </VariantGrid>
);
