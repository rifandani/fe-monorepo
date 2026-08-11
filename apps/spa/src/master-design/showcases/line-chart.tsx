import { LineChart } from "@/core/components/ui/line-chart";

import { revenueConfig, revenueData } from "../fixtures";
import { Variant } from "../variant";

export const LineChartShowcase = () => (
  <div className="flex w-full flex-col gap-12">
    <Variant className="w-full" label="default">
      <LineChart
        className="w-full"
        config={revenueConfig}
        data={revenueData}
        dataKey="month"
      />
    </Variant>
  </div>
);
