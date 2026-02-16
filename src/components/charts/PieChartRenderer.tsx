/**
 * PieChartRenderer
 *
 * Recharts-based pie/donut chart for part-to-whole composition.
 * Features interactive hover states, label rendering, theme-aware
 * colors, and accessible data table fallback. Supports max 6-8
 * slices per accessibility best practices.
 */

import React, { useCallback, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import { ChartTooltip } from './ChartTooltip';
import { AccessibleChartWrapper } from './AccessibleChartWrapper';
import type { ChartSeries, ChartDataPoint } from '../../types/dashboard';
import type { TooltipFormatType } from './ChartTooltip';

export interface PieChartRendererProps {
  /** Chart data points */
  data: ChartDataPoint[];
  /** Series definition (uses first series for value key) */
  series: ChartSeries[];
  /** Label key for each slice */
  labelKey: string;
  /** Chart height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Donut mode (inner radius > 0) */
  donut?: boolean;
  /** Value format type for tooltips */
  formatType?: TooltipFormatType;
  /** Custom value formatter */
  valueFormatter?: (value: number) => string;
  /** Chart title for accessibility */
  title?: string;
  /** Chart description for accessibility */
  description?: string;
  /** Animate transitions */
  animate?: boolean;
  /** Show percentage labels on slices */
  showLabels?: boolean;
  /** Show percentage in labels */
  showPercentage?: boolean;
  /** Click handler */
  onSliceClick?: (data: any, index: number) => void;
}

export function PieChartRenderer({
  data,
  series,
  labelKey,
  height = 300,
  showLegend = true,
  donut = false,
  formatType = 'default',
  valueFormatter,
  title = 'Pie Chart',
  description,
  animate = true,
  showLabels = true,
  showPercentage = true,
  onSliceClick,
}: PieChartRendererProps) {
  const maxSlices = 8;
  const chartColors = useChartColors(maxSlices);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const dataKey = series[0]?.dataKey;
  if (!dataKey) return null;

  // Limit slices and aggregate remainder as "Other"
  let chartData = [...data];
  if (chartData.length > maxSlices) {
    const top = chartData.slice(0, maxSlices - 1);
    const rest = chartData.slice(maxSlices - 1);
    const otherValue = rest.reduce((sum, d) => sum + (Number(d[dataKey]) || 0), 0);
    chartData = [...top, { [labelKey]: 'Other', [dataKey]: otherValue }];
  }

  // Calculate total for percentage display
  const total = chartData.reduce((sum, d) => sum + (Number(d[dataKey]) || 0), 0);

  const handleSliceClick = useCallback(
    (data: any, index: number) => {
      onSliceClick?.(data, index);
    },
    [onSliceClick],
  );

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  // Outer label renderer
  const renderLabel = useCallback(
    (props: any) => {
      if (!showLabels) return null;

      const { cx, cy, midAngle, outerRadius, index, value } = props;
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 20;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      const labelName = String(chartData[index]?.[labelKey] ?? '');

      // Only show label if slice is large enough (> 5%)
      if (total > 0 && (value / total) < 0.05) return null;

      return (
        <text
          x={x}
          y={y}
          fill={chartColors.axisTextColor}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={11}
        >
          {labelName}{showPercentage ? ` (${percent}%)` : ''}
        </text>
      );
    },
    [chartData, chartColors.axisTextColor, labelKey, showLabels, showPercentage, total],
  );

  // Active shape for hover highlight
  const renderActiveShape = useCallback(
    (props: any) => {
      const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, value,
      } = props;

      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

      return (
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          {donut && (
            <>
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fill={chartColors.axisTextColor}
                fontSize={14}
                fontWeight="600"
              >
                {payload[labelKey]}
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fill={chartColors.axisTextColor}
                fontSize={12}
              >
                {percent}%
              </text>
            </>
          )}
        </g>
      );
    },
    [chartColors.axisTextColor, donut, labelKey, total],
  );

  // Accessible columns
  const columns = [labelKey, series[0]?.name || 'Value', 'Percentage'];
  const accessDataKeys = [labelKey, dataKey, '__percent__'];
  const accessData = chartData.map((d) => ({
    ...d,
    __percent__: total > 0 ? `${((Number(d[dataKey]) / total) * 100).toFixed(1)}%` : '0%',
  }));

  const innerRadius = donut ? '55%' : 0;
  const outerRadius = '80%';

  return (
    <AccessibleChartWrapper
      title={title}
      description={description}
      data={accessData}
      columns={columns}
      dataKeys={accessDataKeys}
      formatters={valueFormatter ? { [dataKey]: valueFormatter } : {}}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={labelKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke={chartColors.cardBg}
            strokeWidth={2}
            label={activeIndex === undefined ? renderLabel : undefined}
            labelLine={showLabels}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={(data, index) => handleSliceClick(data, index)}
            cursor={onSliceClick ? 'pointer' : undefined}
            isAnimationActive={animate}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={chartColors.getColor(i)}
              />
            ))}
          </Pie>

          <Tooltip
            content={
              <ChartTooltip
                formatType={formatType}
                valueFormatter={valueFormatter}
              />
            }
          />

          {showLegend && (
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 12, paddingLeft: 16 }}
              formatter={(value: string, entry: any) => {
                const idx = chartData.findIndex((d) => d[labelKey] === value);
                const val = idx >= 0 ? Number(chartData[idx][dataKey]) : 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return `${value} (${pct}%)`;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </AccessibleChartWrapper>
  );
}

export default PieChartRenderer;
