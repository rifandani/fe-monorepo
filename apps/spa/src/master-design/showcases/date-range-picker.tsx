import { CalendarDate } from "@internationalized/date";

import {
  DateRangePicker,
  DateRangePickerTrigger,
} from "@/core/components/ui/date-range-picker";
import { Label } from "@/core/components/ui/field";

import { Variant, VariantGrid } from "../variant";

const range = {
  end: new CalendarDate(2026, 8, 18),
  start: new CalendarDate(2026, 8, 11),
};

export const DateRangePickerShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <DateRangePicker defaultValue={range}>
        <Label>Dates</Label>
        <DateRangePickerTrigger />
      </DateRangePicker>
    </Variant>

    <Variant label="isDisabled">
      <DateRangePicker defaultValue={range} isDisabled>
        <Label>Dates</Label>
        <DateRangePickerTrigger />
      </DateRangePicker>
    </Variant>
  </VariantGrid>
);
