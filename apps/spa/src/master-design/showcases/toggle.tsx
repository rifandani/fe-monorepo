import { Toggle } from "@/core/components/ui/toggle";

import { Variant, VariantGrid } from "../variant";

export const ToggleShowcase = () => (
  <VariantGrid>
    <Variant label="outline">
      <Toggle defaultSelected intent="outline">
        Outline
      </Toggle>
    </Variant>

    <Variant label="plain">
      <Toggle intent="plain">Plain</Toggle>
    </Variant>
  </VariantGrid>
);
