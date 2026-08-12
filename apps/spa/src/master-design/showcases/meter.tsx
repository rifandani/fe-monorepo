import {
  Meter,
  MeterHeader,
  MeterTrack,
  MeterValue,
} from "@/core/components/ui/meter";

import { Variant, VariantGrid } from "../variant";

export const MeterShowcase = () => (
  <VariantGrid>
    <Variant className="w-56" label="value 70">
      <Meter aria-label="Storage" className="w-56" value={70}>
        <MeterHeader>
          <span>Storage</span>
          <MeterValue />
        </MeterHeader>
        <MeterTrack />
      </Meter>
    </Variant>
  </VariantGrid>
);
