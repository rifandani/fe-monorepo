import { Label } from "@/core/components/ui/field";
import { NumberField, NumberInput } from "@/core/components/ui/number-field";

import { Variant, VariantGrid } from "../variant";

export const NumberFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <NumberField className="w-40" defaultValue={10}>
        <Label>Quantity</Label>
        <NumberInput />
      </NumberField>
    </Variant>

    <Variant label="isInvalid">
      <NumberField className="w-40" defaultValue={-1} isInvalid>
        <Label>Quantity</Label>
        <NumberInput />
      </NumberField>
    </Variant>

    <Variant label="isDisabled">
      <NumberField className="w-40" defaultValue={5} isDisabled>
        <Label>Quantity</Label>
        <NumberInput />
      </NumberField>
    </Variant>
  </VariantGrid>
);
