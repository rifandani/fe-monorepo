import { Pressable } from "react-aria-components/Pressable";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import { Variant, VariantGrid } from "../variant";

export const ContextMenuShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <ContextMenu>
        <Pressable>
          <button
            className="text-muted-foreground rounded-lg border border-dashed px-8 py-6 text-sm"
            type="button"
          >
            Right click here
          </button>
        </Pressable>
        <ContextMenuContent>
          <ContextMenuItem id="a">Edit</ContextMenuItem>
          <ContextMenuItem id="b">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Variant>
  </VariantGrid>
);
