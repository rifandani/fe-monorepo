import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const MenuShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Menu>
        <MenuTrigger>
          <Button intent="outline">Open</Button>
        </MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem id="a">Edit</MenuItem>
          <MenuItem id="b">Delete</MenuItem>
        </MenuContent>
      </Menu>
    </Variant>
  </VariantGrid>
);
