import { ColorSwatch } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const ColorSwatchShowcase = () => (
  <VariantGrid>
    <Variant label="#0d6efd">
      <ColorSwatch color="#0d6efd" />
    </Variant>
    <Variant label="#198754">
      <ColorSwatch color="#198754" />
    </Variant>
  </VariantGrid>
);
