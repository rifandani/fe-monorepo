import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarSeparator,
} from "@/core/components/ui/toolbar";

import { Variant, VariantGrid } from "../variant";

export const ToolbarShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Toolbar aria-label="Formatting">
        <ToolbarGroup>
          <ToolbarItem>Bold</ToolbarItem>
          <ToolbarItem>Italic</ToolbarItem>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarItem>Link</ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    </Variant>
  </VariantGrid>
);
