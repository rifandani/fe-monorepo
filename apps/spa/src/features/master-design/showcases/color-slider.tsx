import {
  ColorSlider,
  ColorSliderOutput,
  ColorSliderTrack,
} from "@/components/ui/color-slider";
import { ColorThumb } from "@/components/ui/color-thumb";
import { Label } from "@/components/ui/field";

import { brandHsl } from "../fixtures";
import { Variant } from "../variant";

export const ColorSliderShowcase = () => (
  <Variant className="w-64" label="hue">
    <ColorSlider channel="hue" defaultValue={brandHsl}>
      <Label>Hue</Label>
      <ColorSliderOutput />
      <ColorSliderTrack>
        <ColorThumb />
      </ColorSliderTrack>
    </ColorSlider>
  </Variant>
);
