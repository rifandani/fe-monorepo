import { Time } from "@internationalized/date";

import { Label, TimeField, TimeInput } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const TimeFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TimeField defaultValue={new Time(9, 30)}>
        <Label>Start time</Label>
        <TimeInput />
      </TimeField>
    </Variant>

    <Variant label="isDisabled">
      <TimeField defaultValue={new Time(9, 30)} isDisabled>
        <Label>Start time</Label>
        <TimeInput />
      </TimeField>
    </Variant>
  </VariantGrid>
);
