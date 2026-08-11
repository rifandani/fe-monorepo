// Deep import: AreaChart is intentionally not re-exported from the `ui` barrel
// (keeps recharts out of the main chunk), so the catalog imports it directly.
import { AreaChart } from "@/core/components/ui/area-chart";

import { revenueConfig, revenueData } from "../fixtures";
import { Variant } from "../variant";

export const AreaChartShowcase = () => (
  <div className="flex flex-col gap-8">
    <Variant label="gradient">
      <div className="h-72 w-full max-w-2xl">
        <AreaChart
          config={revenueConfig}
          data={revenueData}
          dataKey="month"
          fillType="gradient"
        />
      </div>
    </Variant>

    <Variant label="stacked">
      <div className="h-72 w-full max-w-2xl">
        <AreaChart
          config={revenueConfig}
          data={revenueData}
          dataKey="month"
          type="stacked"
        />
      </div>
    </Variant>
  </div>
);
