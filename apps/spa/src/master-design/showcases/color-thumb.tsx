import {
  ColorSlider,
  ColorSliderTrack,
} from "@/core/components/ui/color-slider";
import { ColorThumb } from "@/core/components/ui/color-thumb";

import { brandHsl } from "../fixtures";
import { Variant } from "../variant";

export const ColorThumbShowcase = () => (
  <Variant className="w-64" label="in slider">
    <ColorSlider channel="hue" defaultValue={brandHsl}>
      <ColorSliderTrack>
        <ColorThumb />
      </ColorSliderTrack>
    </ColorSlider>
  </Variant>
);
