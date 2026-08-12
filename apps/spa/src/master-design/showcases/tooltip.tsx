import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

import { Variant, VariantGrid } from "../variant";

export const TooltipShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful hint</TooltipContent>
      </Tooltip>
    </Variant>

    <Variant label="inverse">
      <Tooltip>
        <TooltipTrigger>Inverse</TooltipTrigger>
        <TooltipContent inverse>High-contrast hint</TooltipContent>
      </Tooltip>
    </Variant>
  </VariantGrid>
);
