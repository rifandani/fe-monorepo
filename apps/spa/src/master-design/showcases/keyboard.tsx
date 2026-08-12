import { Keyboard } from "@/core/components/ui/keyboard";

import { Variant, VariantGrid } from "../variant";

export const KeyboardShowcase = () => (
  <VariantGrid>
    <Variant label="shortcut">
      <Keyboard className="inline">⌘K</Keyboard>
    </Variant>
  </VariantGrid>
);
