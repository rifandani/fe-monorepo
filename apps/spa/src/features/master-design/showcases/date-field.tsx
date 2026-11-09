import { CalendarDate } from "@internationalized/date";

import { DateField, DateInput } from "@/components/ui/date-field";
import { Label } from "@/components/ui/field";

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
