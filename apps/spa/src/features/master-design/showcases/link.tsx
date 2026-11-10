import { Link } from "@/components/ui/link";

import { Variant, VariantGrid } from "../variant";

export const LinkShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Link href="#">Documentation</Link>
    </Variant>
  </VariantGrid>
);
