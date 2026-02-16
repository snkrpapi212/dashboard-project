/**
 * Charts Module - Public API
 *
 * All chart components, utilities, and types for the dashboard
 * visualization system. Built on Recharts with theme-aware colors,
 * WCAG 2.1 AA accessibility, and colorblind-safe palettes.
 */

export { LineChartRenderer } from './LineChartRenderer';
export type { LineChartRendererProps } from './LineChartRenderer';

export { AreaChartRenderer } from './AreaChartRenderer';
export type { AreaChartRendererProps } from './AreaChartRenderer';

export { BarChartRenderer } from './BarChartRenderer';
export type { BarChartRendererProps } from './BarChartRenderer';

export { PieChartRenderer } from './PieChartRenderer';
export type { PieChartRendererProps } from './PieChartRenderer';

export { AccessibleChartWrapper } from './AccessibleChartWrapper';
export type { AccessibleChartWrapperProps } from './AccessibleChartWrapper';

export { ChartTooltip } from './ChartTooltip';
export type { ChartTooltipProps, TooltipFormatType } from './ChartTooltip';

export { ChartPatternDefs } from './ChartPatternDefs';
export type { ChartPatternDefsProps } from './ChartPatternDefs';
