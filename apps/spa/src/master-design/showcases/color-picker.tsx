import { ColorArea } from "@/core/components/ui/color-area";
import { ColorField } from "@/core/components/ui/color-field";
import { ColorPicker } from "@/core/components/ui/color-picker";
import {
  ColorSlider,
  ColorSliderOutput,
  ColorSliderTrack,
} from "@/core/components/ui/color-slider";
import { ColorThumb } from "@/core/components/ui/color-thumb";
import { Label } from "@/core/components/ui/field";
import { Input } from "@/core/components/ui/input";

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
