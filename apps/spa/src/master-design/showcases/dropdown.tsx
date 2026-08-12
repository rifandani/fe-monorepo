import {
  DropdownItem,
  DropdownLabel,
  DropdownSection,
} from "@/core/components/ui/dropdown";
import { ListBox } from "@/core/components/ui/list-box";

import { Variant, VariantGrid } from "../variant";

export const DropdownShowcase = () => (
  <VariantGrid>
    <Variant label="in ListBox">
      <ListBox aria-label="Fruits" className="w-48" selectionMode="single">
        <DropdownSection title="Fruits">
          <DropdownItem id="apple">
            <DropdownLabel>Apple</DropdownLabel>
          </DropdownItem>
          <DropdownItem id="banana">
            <DropdownLabel>Banana</DropdownLabel>
          </DropdownItem>
        </DropdownSection>
      </ListBox>
    </Variant>
  </VariantGrid>
);
