import { Separator } from "@/core/components/ui/separator";

import { Variant, VariantGrid } from "../variant";

export const SeparatorShowcase = () => (
  <VariantGrid>
    <Variant className="w-56" label="horizontal">
      <div className="w-full">
        <p className="text-sm">Above</p>
        <Separator className="my-3" />
        <p className="text-sm">Below</p>
      </div>
    </Variant>
    <Variant label="vertical">
      <div className="flex h-12 items-center gap-3">
        <p className="text-sm">Left</p>
        <Separator orientation="vertical" />
        <p className="text-sm">Right</p>
      </div>
    </Variant>
  </VariantGrid>
);
