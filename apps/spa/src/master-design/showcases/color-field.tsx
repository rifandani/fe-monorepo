import { ColorField, Input, Label } from "@/core/components/ui";

import { Variant } from "../variant";

export const ColorFieldShowcase = () => (
  <Variant label="default">
    <ColorField className="w-64" defaultValue="#0d6efd">
      <Label>Brand</Label>
      <Input />
    </ColorField>
  </Variant>
);
