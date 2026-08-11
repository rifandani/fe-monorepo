import { ProgressCircle } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const ProgressCircleShowcase = () => (
  <VariantGrid>
    <Variant label="value 60">
      <ProgressCircle aria-label="Progress" className="size-8" value={60} />
    </Variant>
  </VariantGrid>
);
