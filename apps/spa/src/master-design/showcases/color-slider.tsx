import {
  ColorSlider,
  ColorSliderOutput,
  ColorSliderTrack,
  ColorThumb,
  Label,
} from "@/core/components/ui";

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
