import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSliderOutput,
  ColorSliderTrack,
  ColorThumb,
  Input,
  Label,
} from "@/core/components/ui";

import { brandHsl } from "../fixtures";
import { Variant } from "../variant";

export const ColorPickerShowcase = () => (
  <Variant label="default">
    <ColorPicker defaultValue={brandHsl}>
      <Label>Brand</Label>
      <div className="flex flex-col gap-3">
        <ColorArea />
        <ColorSlider channel="hue">
          <ColorSliderOutput />
          <ColorSliderTrack>
            <ColorThumb />
          </ColorSliderTrack>
        </ColorSlider>
        <ColorField>
          <Input />
        </ColorField>
      </div>
    </ColorPicker>
  </Variant>
);
