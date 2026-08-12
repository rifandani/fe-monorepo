import { PieChart } from "@/core/components/ui/pie-chart";

import { shareConfig, shareData } from "../fixtures";
import { Variant } from "../variant";

export const PieChartShowcase = () => (
  <div className="flex w-full flex-col gap-12">
    <Variant className="w-full" label="pie">
      <PieChart
        className="w-full"
        config={shareConfig}
        data={shareData}
        dataKey="value"
        nameKey="name"
      />
    </Variant>

    <Variant className="w-full" label="donut">
      <PieChart
        className="w-full"
        config={shareConfig}
        data={shareData}
        dataKey="value"
        nameKey="name"
        showLabel
        variant="donut"
      />
    </Variant>
  </div>
);
