import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
  { id: "durian", name: "Durian" },
];

export const SelectShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Select className="w-56" defaultSelectedKey="apple">
        <Label>Fruit</Label>
        <SelectTrigger />
        <SelectContent items={fruits}>
          {(item) => <SelectItem>{item.name}</SelectItem>}
        </SelectContent>
      </Select>
    </Variant>

    <Variant label="placeholder">
      <Select aria-label="Fruit" className="w-56" placeholder="Pick one…">
        <SelectTrigger />
        <SelectContent items={fruits}>
          {(item) => <SelectItem>{item.name}</SelectItem>}
        </SelectContent>
      </Select>
    </Variant>

    <Variant label="isDisabled">
      <Select
        aria-label="Fruit"
        className="w-56"
        defaultSelectedKey="banana"
        isDisabled
      >
        <SelectTrigger />
        <SelectContent items={fruits}>
          {(item) => <SelectItem>{item.name}</SelectItem>}
        </SelectContent>
      </Select>
    </Variant>
  </VariantGrid>
);
