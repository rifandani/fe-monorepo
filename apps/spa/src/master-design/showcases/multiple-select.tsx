import { Label } from "@/core/components/ui/field";
import {
  MultipleSelect,
  MultipleSelectContent,
  MultipleSelectItem,
} from "@/core/components/ui/multiple-select";

import { Variant, VariantGrid } from "../variant";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
  { id: "durian", name: "Durian" },
];

export const MultipleSelectShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <MultipleSelect className="w-64" defaultSelectedKey="apple">
        <Label>Fruits</Label>
        <MultipleSelectContent items={fruits}>
          {(item) => <MultipleSelectItem>{item.name}</MultipleSelectItem>}
        </MultipleSelectContent>
      </MultipleSelect>
    </Variant>

    <Variant label="placeholder">
      <MultipleSelect
        aria-label="Fruits"
        className="w-64"
        placeholder="Pick fruits…"
      >
        <MultipleSelectContent items={fruits}>
          {(item) => <MultipleSelectItem>{item.name}</MultipleSelectItem>}
        </MultipleSelectContent>
      </MultipleSelect>
    </Variant>

    <Variant label="isDisabled">
      <MultipleSelect
        aria-label="Fruits"
        className="w-64"
        defaultSelectedKey="banana"
        isDisabled
      >
        <MultipleSelectContent items={fruits}>
          {(item) => <MultipleSelectItem>{item.name}</MultipleSelectItem>}
        </MultipleSelectContent>
      </MultipleSelect>
    </Variant>
  </VariantGrid>
);
