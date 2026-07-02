"use client";
import { useMemo } from "react";
import type { LineProps } from "recharts";
import { Line, LineChart as LineChartPrimitive } from "recharts";

import type { BaseChartProps } from "./chart";
import {
  CartesianGrid,
  Chart,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  constructCategoryColors,
  DEFAULT_COLORS,
  getColorValue,
  valueToPercent,
  XAxis,
  YAxis,
} from "./chart";

export interface LineChartProps extends BaseChartProps {
  connectNulls?: boolean;
  lineProps?: LineProps;
  chartProps?: Omit<
    React.ComponentProps<typeof LineChartPrimitive>,
    "data" | "stackOffset"
  >;
}
const DEFAULT_LINE_CHART_DATA: never[] = [];
const DEFAULT_LINE_CHART_FORMATTER = (value: number) => value.toString();

export const LineChart = ({
  data = DEFAULT_LINE_CHART_DATA,
  dataKey,
  colors = DEFAULT_COLORS,
  connectNulls = false,
  type = "default",
  config,
  children,
  // Components
  tooltip = true,
  tooltipProps,
  legend = true,
  legendProps,
  intervalType = "equidistantPreserveStart",
  valueFormatter = DEFAULT_LINE_CHART_FORMATTER,
  // XAxis
  displayEdgeLabelsOnly = false,
  xAxisProps,
  hideXAxis = false,
  // YAxis
  yAxisProps,
  hideYAxis = false,
  hideGridLines = false,
  chartProps,
  lineProps,
  ...props
}: LineChartProps) => {
  const configKeys = useMemo(() => Object.keys(config), [config]);
  const categoryColors = useMemo(
    () => constructCategoryColors(configKeys, colors),
    [configKeys, colors]
  );
  const configEntries = useMemo(() => Object.entries(config), [config]);
  return (
    <Chart config={config} data={data} dataKey={dataKey} {...props}>
      {({ onLegendSelect, selectedLegend }) => (
        <LineChartPrimitive
          onClick={() => {
            onLegendSelect(null);
          }}
          data={data}
          margin={{
            bottom: 0,
            left: 0,
            right: 0,
            top: 5,
          }}
          stackOffset={type === "percent" ? "expand" : undefined}
          {...chartProps}
        >
          {!hideGridLines && <CartesianGrid strokeDasharray="4 4" />}
          <XAxis
            hide={hideXAxis}
            displayEdgeLabelsOnly={displayEdgeLabelsOnly}
            intervalType={intervalType}
            {...xAxisProps}
          />
          <YAxis
            hide={hideYAxis}
            tickFormatter={type === "percent" ? valueToPercent : valueFormatter}
            {...yAxisProps}
          />

          {legend && (
            <ChartLegend
              content={
                typeof legend === "boolean" ? <ChartLegendContent /> : legend
              }
              {...legendProps}
            />
          )}

          {tooltip && (
            <ChartTooltip
              content={
                typeof tooltip === "boolean" ? (
                  <ChartTooltipContent accessibilityLayer />
                ) : (
                  tooltip
                )
              }
              {...tooltipProps}
            />
          )}

          {children ??
            configEntries.map(([category, values]) => {
              const strokeOpacity =
                selectedLegend && selectedLegend !== category ? 0.1 : 1;
              const color = getColorValue(
                values.color || categoryColors.get(category)
              );
              return (
                <Line
                  key={category}
                  dot={false}
                  name={category}
                  type="linear"
                  dataKey={category}
                  stroke={color}
                  style={
                    {
                      "--line-color": color,
                      strokeOpacity,
                      strokeWidth: 2,
                    } as React.CSSProperties
                  }
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  connectNulls={connectNulls}
                  {...lineProps}
                />
              );
            })}
        </LineChartPrimitive>
      )}
    </Chart>
  );
};
