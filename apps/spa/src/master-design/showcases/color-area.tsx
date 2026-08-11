import { ColorArea } from "@/core/components/ui";

import { brandHsl } from "../fixtures";
import { Variant } from "../variant";

export const ColorAreaShowcase = () => (
  <Variant label="default">
    <ColorArea defaultValue={brandHsl} />
  </Variant>
);
