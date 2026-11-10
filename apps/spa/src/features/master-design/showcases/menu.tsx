import { Button } from "@/components/ui/button";
import { Menu, MenuTrigger, MenuItem } from "@/components/ui/menu";

import { Variant, VariantGrid } from "../variant";

export const MenuShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <MenuTrigger>
        <Button intent="outline">Open</Button>

        <Menu aria-label="Actions">
          <MenuItem id="a">Edit</MenuItem>
          <MenuItem id="b">Delete</MenuItem>
        </Menu>
      </MenuTrigger>
    </Variant>
  </VariantGrid>
);
