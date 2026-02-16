/**
 * AreaChartRenderer
 *
 * Recharts-based area chart with gradient fills, theme-aware colors,
 * accessible tooltips, and responsive sizing. Ideal for showing
 * magnitude and trends over time.
 */

import React, { useCallback, useId } from 'react';
import {
  AreaChart,
  Area,
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
import type { ChartSeries, ChartDataPoint } from '../../types/dashboard';
import type { TooltipFormatType } from './ChartTooltip';

export interface AreaChartRendererProps {
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
  /** Stack areas */
  stacked?: boolean;
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
  /** Gradient fill opacity */
  fillOpacity?: number;
  /** Reference line */
  referenceLine?: { value: number; label: string; color?: string };
  /** Click handler */
  onDataPointClick?: (data: any, index: number) => void;
}

export function AreaChartRenderer({
  data,
  series,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  formatType = 'default',
  valueFormatter,
  labelFormatter,
  title = 'Area Chart',
  description,
  animate = true,
  fillOpacity = 0.15,
  referenceLine,
  onDataPointClick,
}: AreaChartRendererProps) {
  const chartColors = useChartColors(series.length);
  const gradientId = useId();

  const handleClick = useCallback(
    (data: any, index: number) => {
      onDataPointClick?.(data, index);
    },
    [onDataPointClick],
  );

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
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onClick={(e) => {
            if (e?.activePayload && onDataPointClick) {
              handleClick(e.activePayload[0]?.payload, e.activeTooltipIndex ?? 0);
            }
          }}
        >
          <defs>
            {series.map((s, i) => {
              const color = s.color || chartColors.getColor(i);
              const gid = `${gradientId}-gradient-${i}`;
              return (
                <linearGradient key={gid} id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2.5} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>

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
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
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
            const gid = `${gradientId}-gradient-${i}`;

            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gid})`}
                fillOpacity={1}
                stackId={stacked ? 'stack' : undefined}
                dot={false}
                activeDot={{
                  r: 5,
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
        </AreaChart>
      </ResponsiveContainer>
    </AccessibleChartWrapper>
  );
}

export default AreaChartRenderer;
