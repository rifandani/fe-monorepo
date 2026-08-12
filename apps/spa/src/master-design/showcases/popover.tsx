import { Button } from "@/core/components/ui/button";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/core/components/ui/popover";

import { Variant, VariantGrid } from "../variant";

export const PopoverShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Popover>
        <Button intent="outline">Open</Button>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Popover</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>
            Short contextual content next to the trigger.
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Variant>
  </VariantGrid>
);
