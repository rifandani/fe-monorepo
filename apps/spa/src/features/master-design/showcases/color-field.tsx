import { ColorField } from "@/components/ui/color-field";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { Variant } from "../variant";

export const ColorFieldShowcase = () => (
  <Variant label="default">
    <ColorField className="w-64" defaultValue="#0d6efd">
      <Label>Brand</Label>
      <Input />
    </ColorField>
  </Variant>
);
