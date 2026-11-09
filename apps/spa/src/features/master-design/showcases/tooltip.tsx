import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

import { Variant, VariantGrid } from "../variant";

export const TooltipShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TooltipTrigger>
        <Button intent="outline">Hover me</Button>
        <Tooltip>Helpful hint</Tooltip>
      </TooltipTrigger>
    </Variant>

    <Variant label="inverse">
      <TooltipTrigger>
        <Button intent="outline">Inverse</Button>
        <Tooltip inverse>High-contrast hint</Tooltip>
      </TooltipTrigger>
    </Variant>
  </VariantGrid>
);
