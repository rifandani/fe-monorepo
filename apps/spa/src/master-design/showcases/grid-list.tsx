import {
  GridList,
  GridListDescription,
  GridListItem,
  GridListLabel,
} from "@/core/components/ui/grid-list";

import { demoUsers } from "../fixtures";
import { Variant, VariantGrid } from "../variant";

export const GridListShowcase = () => (
  <VariantGrid>
    <Variant className="w-72" label="users">
      <GridList
        aria-label="Users"
        className="w-72"
        items={demoUsers}
        selectionMode="single"
      >
        {(user) => (
          <GridListItem id={user.id} textValue={user.name}>
            <div className="flex min-w-0 flex-col">
              <GridListLabel>{user.name}</GridListLabel>
              <GridListDescription>{user.email}</GridListDescription>
            </div>
          </GridListItem>
        )}
      </GridList>
    </Variant>
  </VariantGrid>
);
