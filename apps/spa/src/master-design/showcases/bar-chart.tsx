import { BarChart } from "@/core/components/ui/bar-chart";

import { revenueConfig, revenueData } from "../fixtures";
import { Variant } from "../variant";

export const BarChartShowcase = () => (
  <div className="flex w-full flex-col gap-12">
    <Variant className="w-full" label="default">
      <BarChart
        className="w-full"
        config={revenueConfig}
        data={revenueData}
        dataKey="month"
      />
    </Variant>

    <Variant className="w-full" label="vertical">
      <BarChart
        className="w-full"
        config={revenueConfig}
        data={revenueData}
        dataKey="month"
        layout="vertical"
      />
    </Variant>
  </div>
);
