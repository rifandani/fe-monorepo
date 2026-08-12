import { Tracker } from "@/core/components/ui/tracker";

import { Variant, VariantGrid } from "../variant";

const blocks = [
  { color: "bg-success", tooltip: "Operational" },
  { color: "bg-success", tooltip: "Operational" },
  { color: "bg-success", tooltip: "Operational" },
  { color: "bg-warning", tooltip: "Degraded" },
  { color: "bg-success", tooltip: "Operational" },
  { color: "bg-danger", tooltip: "Outage" },
  { color: "bg-success", tooltip: "Operational" },
  { color: "bg-success", tooltip: "Operational" },
];

export const TrackerShowcase = () => (
  <VariantGrid>
    <Variant className="w-72" label="status">
      <Tracker className="w-72" data={blocks} />
    </Variant>
  </VariantGrid>
);
