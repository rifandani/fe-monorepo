import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";

import { Variant, VariantGrid } from "../variant";

export const ToggleGroupShowcase = () => (
  <VariantGrid>
    <Variant label="single">
      <ToggleGroup defaultSelectedKeys={["day"]}>
        <ToggleGroupItem id="day">Day</ToggleGroupItem>
        <ToggleGroupItem id="week">Week</ToggleGroupItem>
        <ToggleGroupItem id="month">Month</ToggleGroupItem>
      </ToggleGroup>
    </Variant>
  </VariantGrid>
);
