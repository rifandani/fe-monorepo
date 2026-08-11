import {
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
} from "@/core/components/ui";

import { Variant } from "../variant";

export const ColorSwatchPickerShowcase = () => (
  <Variant label="default">
    <ColorSwatchPicker defaultValue="#0d6efd">
      <ColorSwatchPickerItem color="#0d6efd">
        <ColorSwatch />
      </ColorSwatchPickerItem>
      <ColorSwatchPickerItem color="#198754">
        <ColorSwatch />
      </ColorSwatchPickerItem>
      <ColorSwatchPickerItem color="#dc3545">
        <ColorSwatch />
      </ColorSwatchPickerItem>
      <ColorSwatchPickerItem color="#6f42c1">
        <ColorSwatch />
      </ColorSwatchPickerItem>
    </ColorSwatchPicker>
  </Variant>
);
