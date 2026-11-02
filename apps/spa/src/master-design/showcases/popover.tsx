import { Button } from "@/core/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
} from "@/core/components/ui/popover";

import { Variant, VariantGrid } from "../variant";

export const PopoverShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <PopoverTrigger>
        <Button intent="outline">Open</Button>
        <Popover>
          <PopoverHeader>
            <PopoverTitle>Popover</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>
            Short contextual content next to the trigger.
          </PopoverBody>
        </Popover>
      </PopoverTrigger>
    </Variant>
  </VariantGrid>
);
