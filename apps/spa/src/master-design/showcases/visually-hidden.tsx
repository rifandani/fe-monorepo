import { VisuallyHidden } from "@/core/components/ui/visually-hidden";

import { Variant, VariantGrid } from "../variant";

export const VisuallyHiddenShowcase = () => (
  <VariantGrid>
    <Variant label="with visible label">
      <span className="text-sm">
        Save
        <VisuallyHidden> document to drafts</VisuallyHidden>
      </span>
    </Variant>
  </VariantGrid>
);
