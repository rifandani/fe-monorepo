import {
  ColorSlider,
  ColorSliderTrack,
  ColorThumb,
} from "@/core/components/ui";

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
