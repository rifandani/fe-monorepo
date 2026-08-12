import { ColorWheel } from "@/core/components/ui/color-wheel";

import { brandHsl } from "../fixtures";
import { Variant } from "../variant";

export const ColorWheelShowcase = () => (
  <Variant label="default">
    <ColorWheel defaultValue={brandHsl} />
  </Variant>
);
