/**
 * BarChartRenderer
 *
 * Recharts-based bar chart for comparing categorical data.
 * Supports grouped and stacked modes, theme-aware colors,
 * accessible tooltips, colorblind-safe patterns, and click interactions.
 */

import React, { useCallback, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { ChartTooltip } from './ChartTooltip';
import { AccessibleChartWrapper } from './AccessibleChartWrapper';
import type { ChartSeries, ChartDataPoint } from '../../types/dashboard';
import type { TooltipFormatType } from './ChartTooltip';

export interface BarChartRendererProps {
  /** Chart data points */
  data: ChartDataPoint[];
  /** Data series definitions */
  series: ChartSeries[];
  /** X-axis data key (category axis) */
  xAxisKey: string;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Stack bars instead of grouping */
  stacked?: boolean;
  /** Horizontal bar layout */
  horizontal?: boolean;
  /** Value format type for tooltips */
  formatType?: TooltipFormatType;
  /** Custom value formatter */
  valueFormatter?: (value: number) => string;
  /** Custom label formatter */
  labelFormatter?: (label: string) => string;
  /** Chart title for accessibility */
  title?: string;
  /** Chart description for accessibility */
  description?: string;
  /** Animate transitions */
  animate?: boolean;
  /** Bar corner radius */
  barRadius?: number;
  /** Bar gap ratio (0-1) */
  barGap?: number;
  /** Click handler */
  onBarClick?: (data: any, index: number, seriesKey: string) => void;
}

export function BarChartRenderer({
  data,
  series,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  horizontal = false,
  formatType = 'default',
  valueFormatter,
  labelFormatter,
  title = 'Bar Chart',
  description,
  animate = true,
  barRadius = 4,
  barGap = 0.1,
  onBarClick,
}: BarChartRendererProps) {
  const chartColors = useChartColors(series.length);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const handleBarClick = useCallback(
    (data: any, index: number, seriesKey: string) => {
      onBarClick?.(data, index, seriesKey);
    },
    [onBarClick],
  );

  const columns = [xAxisKey, ...series.map((s) => s.name)];
  const dataKeys = [xAxisKey, ...series.map((s) => s.dataKey)];
  const formatters: Record<string, (v: any) => string> = {};
  if (valueFormatter) {
    series.forEach((s) => {
      formatters[s.dataKey] = valueFormatter;
    });
  }

  // For layout direction
  const ChartComponent = BarChart;
  const categoryAxis = horizontal ? (
    <YAxis
      type="category"
      dataKey={xAxisKey}
      stroke={chartColors.axisColor}
      tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
      tickLine={false}
      axisLine={false}
      width={120}
    />
  ) : (
    <XAxis
      dataKey={xAxisKey}
      stroke={chartColors.axisColor}
      tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
      tickLine={false}
      axisLine={{ stroke: chartColors.axisColor }}
      interval={0}
      angle={data.length > 6 ? -35 : 0}
      textAnchor={data.length > 6 ? 'end' : 'middle'}
      height={data.length > 6 ? 60 : 30}
    />
  );

  const valueAxis = horizontal ? (
    <XAxis
      type="number"
      stroke={chartColors.axisColor}
      tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
      tickLine={false}
      axisLine={false}
      tickFormatter={valueFormatter}
    />
  ) : (
    <YAxis
      stroke={chartColors.axisColor}
      tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
      tickLine={false}
      axisLine={false}
      tickFormatter={valueFormatter}
    />
  );

  return (
    <AccessibleChartWrapper
      title={title}
      description={description}
      data={data}
      columns={columns}
      dataKeys={dataKeys}
      formatters={formatters}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 16, left: 0, bottom: data.length > 6 && !horizontal ? 24 : 0 }}
          barGap={barGap}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartColors.gridColor}
              horizontal={!horizontal}
              vertical={horizontal}
            />
          )}

          {categoryAxis}
          {valueAxis}

          <Tooltip
            content={
              <ChartTooltip
                formatType={formatType}
                valueFormatter={valueFormatter}
                labelFormatter={labelFormatter}
              />
            }
            cursor={{ fill: chartColors.gridColor, opacity: 0.3 }}
          />

          {showLegend && (
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
          )}

          {series.map((s, i) => {
            const color = s.color || chartColors.getColor(i);
            const radius: [number, number, number, number] = stacked
              ? i === series.length - 1
                ? [barRadius, barRadius, 0, 0]
                : [0, 0, 0, 0]
              : [barRadius, barRadius, 0, 0];

            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={color}
                stackId={stacked ? 'stack' : undefined}
                radius={horizontal ? [0, barRadius, barRadius, 0] : radius}
                isAnimationActive={animate}
                animationDuration={600}
                animationEasing="ease-out"
                cursor={onBarClick ? 'pointer' : undefined}
                onClick={(data, index) => handleBarClick(data, index, s.dataKey)}
                onMouseEnter={(_, index) => setActiveBarIndex(index)}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={color}
                    opacity={activeBarIndex !== null && activeBarIndex !== idx ? 0.5 : 0.85}
                  />
                ))}
              </Bar>
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </AccessibleChartWrapper>
  );
}

export default BarChartRenderer;
