import { CalendarDate } from "@internationalized/date";

import { Calendar } from "@/core/components/ui/calendar";

import { Variant, VariantGrid } from "../variant";

export const CalendarShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Calendar
        aria-label="Event date"
        defaultValue={new CalendarDate(2026, 8, 11)}
      />
    </Variant>
  </VariantGrid>
);
