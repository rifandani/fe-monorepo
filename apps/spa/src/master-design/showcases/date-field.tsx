import { CalendarDate } from "@internationalized/date";

import { DateField, DateInput, Label } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const DateFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <DateField defaultValue={new CalendarDate(2026, 8, 11)}>
        <Label>Event date</Label>
        <DateInput />
      </DateField>
    </Variant>

    <Variant label="isDisabled">
      <DateField defaultValue={new CalendarDate(2026, 8, 11)} isDisabled>
        <Label>Event date</Label>
        <DateInput />
      </DateField>
    </Variant>
  </VariantGrid>
);
