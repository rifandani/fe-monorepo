import {
  ComboBox,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxItem,
  Label,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

const fruits = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
];

export const ComboBoxShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <ComboBox className="w-56" defaultSelectedKey="apple">
        <Label>Fruit</Label>
        <ComboBoxInput />
        <ComboBoxContent items={fruits}>
          {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
        </ComboBoxContent>
      </ComboBox>
    </Variant>

    <Variant label="placeholder">
      <ComboBox aria-label="Fruit" className="w-56">
        <ComboBoxInput placeholder="Pick a fruit…" />
        <ComboBoxContent items={fruits}>
          {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
        </ComboBoxContent>
      </ComboBox>
    </Variant>

    <Variant label="isDisabled">
      <ComboBox
        aria-label="Fruit"
        className="w-56"
        defaultSelectedKey="banana"
        isDisabled
      >
        <ComboBoxInput />
        <ComboBoxContent items={fruits}>
          {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
        </ComboBoxContent>
      </ComboBox>
    </Variant>
  </VariantGrid>
);
