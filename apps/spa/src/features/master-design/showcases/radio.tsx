import { Label } from "@/components/ui/field";
import { Radio, RadioField, RadioGroup } from "@/components/ui/radio";

import { Variant, VariantGrid } from "../variant";

export const RadioShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <RadioGroup defaultValue="apple">
        <Label>Fruit</Label>
        <RadioField value="apple">
          <Radio>Apple</Radio>
        </RadioField>
        <RadioField value="banana">
          <Radio>Banana</Radio>
        </RadioField>
        <RadioField value="cherry">
          <Radio>Cherry</Radio>
        </RadioField>
      </RadioGroup>
    </Variant>

    <Variant label="isDisabled">
      <RadioGroup defaultValue="banana" isDisabled>
        <Label>Fruit</Label>
        <RadioField value="apple">
          <Radio>Apple</Radio>
        </RadioField>
        <RadioField value="banana">
          <Radio>Banana</Radio>
        </RadioField>
        <RadioField value="cherry">
          <Radio>Cherry</Radio>
        </RadioField>
      </RadioGroup>
    </Variant>
  </VariantGrid>
);
