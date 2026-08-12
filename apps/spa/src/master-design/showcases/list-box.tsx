import { ListBox, ListBoxItem } from "@/core/components/ui/list-box";

import { Variant, VariantGrid } from "../variant";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
  { id: "durian", name: "Durian" },
];

export const ListBoxShowcase = () => (
  <VariantGrid>
    <Variant label="single">
      <ListBox
        aria-label="Fruit"
        className="w-56 border"
        defaultSelectedKeys={["apple"]}
        items={fruits}
        selectionMode="single"
      >
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
      </ListBox>
    </Variant>
  </VariantGrid>
);
