import { CalendarDate } from "@internationalized/date";

import {
  DatePicker,
  DatePickerTrigger,
} from "@/core/components/ui/date-picker";
import { Label } from "@/core/components/ui/field";

import { Variant, VariantGrid } from "../variant";

export const DatePickerShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <DatePicker defaultValue={new CalendarDate(2026, 8, 11)}>
        <Label>Event date</Label>
        <DatePickerTrigger />
      </DatePicker>
    </Variant>

    <Variant label="isDisabled">
      <DatePicker defaultValue={new CalendarDate(2026, 8, 11)} isDisabled>
        <Label>Event date</Label>
        <DatePickerTrigger />
      </DatePicker>
    </Variant>
  </VariantGrid>
);
