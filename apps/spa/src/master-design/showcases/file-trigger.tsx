import { FileTrigger } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const FileTriggerShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <FileTrigger>Upload a file</FileTrigger>
    </Variant>

    <Variant label="allowsMultiple">
      <FileTrigger allowsMultiple>Upload files</FileTrigger>
    </Variant>

    <Variant label="isDisabled">
      <FileTrigger isDisabled>Upload a file</FileTrigger>
    </Variant>
  </VariantGrid>
);
