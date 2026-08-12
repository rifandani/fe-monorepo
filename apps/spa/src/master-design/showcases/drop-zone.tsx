import { DropZone } from "@/core/components/ui/drop-zone";

import { Variant, VariantGrid } from "../variant";

export const DropZoneShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <DropZone className="w-64">Drop files here</DropZone>
    </Variant>

    <Variant label="isDisabled">
      <DropZone className="w-64" isDisabled>
        Dropping disabled
      </DropZone>
    </Variant>
  </VariantGrid>
);
