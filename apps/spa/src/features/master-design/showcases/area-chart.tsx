import { AreaChart } from "@/components/ui/area-chart";

import { revenueConfig, revenueData } from "../fixtures";
import { Variant } from "../variant";

export const AreaChartShowcase = () => (
  <div className="flex w-full flex-col gap-12">
    <Variant className="w-full" label="gradient">
      <AreaChart
        className="w-full"
        config={revenueConfig}
        data={revenueData}
        dataKey="month"
        fillType="gradient"
      />
    </Variant>

    <Variant className="w-full" label="stacked">
      <AreaChart
        className="w-full"
        config={revenueConfig}
        data={revenueData}
        dataKey="month"
        type="stacked"
      />
    </Variant>
  </div>
);
