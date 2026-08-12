import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/core/components/ui/context-menu";

import { Variant, VariantGrid } from "../variant";

export const ContextMenuShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <ContextMenu>
        <ContextMenuTrigger className="rounded-lg border border-dashed px-8 py-6 text-muted-fg text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem id="a">Edit</ContextMenuItem>
          <ContextMenuItem id="b">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Variant>
  </VariantGrid>
);
