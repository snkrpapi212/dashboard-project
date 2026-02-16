/**
 * LineChartRenderer
 *
 * Recharts-based line chart with theme-aware colors, accessible tooltips,
 * responsive sizing, and smooth animations. Supports multiple series
 * with colorblind-safe differentiation via dash patterns.
 */

import React, { useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { ChartTooltip } from './ChartTooltip';
import { AccessibleChartWrapper } from './AccessibleChartWrapper';
import { getStrokeDasharray, getSeriesPattern } from '../../utils/colorblind';
import type { ChartSeries, ChartDataPoint } from '../../types/dashboard';
import type { TooltipFormatType } from './ChartTooltip';

export interface LineChartRendererProps {
  /** Chart data points */
  data: ChartDataPoint[];
  /** Data series definitions */
  series: ChartSeries[];
  /** X-axis data key */
  xAxisKey: string;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Value format type for tooltips */
  formatType?: TooltipFormatType;
  /** Custom value formatter */
  valueFormatter?: (value: number) => string;
  /** Custom label formatter for x-axis tooltip display */
  labelFormatter?: (label: string) => string;
  /** Chart title for accessibility */
  title?: string;
  /** Chart description for accessibility */
  description?: string;
  /** Whether to show colorblind patterns on lines */
  usePatterns?: boolean;
  /** Animate transitions */
  animate?: boolean;
  /** Reference line value (e.g., target) */
  referenceLine?: { value: number; label: string; color?: string };
  /** Click handler for data points */
  onDataPointClick?: (data: any, index: number) => void;
}

export function LineChartRenderer({
  data,
  series,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatType = 'default',
  valueFormatter,
  labelFormatter,
  title = 'Line Chart',
  description,
  usePatterns = true,
  animate = true,
  referenceLine,
  onDataPointClick,
}: LineChartRendererProps) {
  const chartColors = useChartColors(series.length);

  const handleClick = useCallback(
    (data: any, index: number) => {
      onDataPointClick?.(data, index);
    },
    [onDataPointClick],
  );

  // Build accessible data table columns
  const columns = [xAxisKey, ...series.map((s) => s.name)];
  const dataKeys = [xAxisKey, ...series.map((s) => s.dataKey)];
  const formatters: Record<string, (v: any) => string> = {};
  if (valueFormatter) {
    series.forEach((s) => {
      formatters[s.dataKey] = valueFormatter;
    });
  }

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
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onClick={(e) => {
            if (e?.activePayload && onDataPointClick) {
              handleClick(e.activePayload[0]?.payload, e.activeTooltipIndex ?? 0);
            }
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartColors.gridColor}
              vertical={false}
            />
          )}

          <XAxis
            dataKey={xAxisKey}
            stroke={chartColors.axisColor}
            tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.axisColor }}
          />

          <YAxis
            stroke={chartColors.axisColor}
            tick={{ fill: chartColors.axisTextColor, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />

          <Tooltip
            content={
              <ChartTooltip
                formatType={formatType}
                valueFormatter={valueFormatter}
                labelFormatter={labelFormatter}
              />
            }
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            />
          )}

          {referenceLine && (
            <ReferenceLine
              y={referenceLine.value}
              stroke={referenceLine.color || chartColors.getColor(series.length)}
              strokeDasharray="8 4"
              label={{
                value: referenceLine.label,
                fill: chartColors.axisTextColor,
                fontSize: 11,
              }}
            />
          )}

          {series.map((s, i) => {
            const color = s.color || chartColors.getColor(i);
            const pattern = usePatterns ? getSeriesPattern(i) : 'solid';
            const dashArray = getStrokeDasharray(pattern);

            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashArray !== 'none' ? dashArray : undefined}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: color,
                  stroke: chartColors.cardBg,
                  strokeWidth: 2,
                }}
                isAnimationActive={animate}
                animationDuration={800}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </AccessibleChartWrapper>
  );
}

export default LineChartRenderer;
