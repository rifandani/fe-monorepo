import { BarList } from "@/core/components/ui/bar-list";

import { Variant, VariantGrid } from "../variant";

const sources = [
  { name: "Direct", value: 1200 },
  { name: "Organic", value: 890 },
  { name: "Referral", value: 420 },
];

export const BarListShowcase = () => (
  <VariantGrid>
    <Variant className="w-72" label="descending">
      <BarList className="w-72" data={sources} />
    </Variant>
  </VariantGrid>
);
