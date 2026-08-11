import { CalendarDate } from "@internationalized/date";

import { RangeCalendar } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const RangeCalendarShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <RangeCalendar
        aria-label="Stay dates"
        defaultValue={{
          end: new CalendarDate(2026, 8, 18),
          start: new CalendarDate(2026, 8, 11),
        }}
      />
    </Variant>
  </VariantGrid>
);
