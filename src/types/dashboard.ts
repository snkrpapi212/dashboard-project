/* ==========================================================================
   Dashboard Types & Interfaces
   Shared TypeScript types for the Sales Dashboard
   ========================================================================== */

/* --------------------------------------------------------------------------
   KPI / Metric Types
   -------------------------------------------------------------------------- */

export type TrendDirection = 'up' | 'down' | 'neutral';

export type KPIStatus = 'positive' | 'negative' | 'neutral' | 'warning';

export interface KPIData {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Primary metric value (raw number) */
  value: number;
  /** Previous period value for comparison */
  previousValue?: number;
  /** Percentage change from previous period */
  trend: number;
  /** Direction of the trend */
  trendDirection: TrendDirection;
  /** Status derived from trend and thresholds */
  status: KPIStatus;
  /** Format type for display */
  format: 'currency' | 'number' | 'percentage' | 'decimal';
  /** Mini sparkline data points */
  sparkline?: number[];
  /** Icon identifier */
  icon?: string;
  /** Comparison label (e.g., "vs last month") */
  comparisonLabel?: string;
  /** Target value for progress display */
  target?: number;
}

/* --------------------------------------------------------------------------
   Chart Types
   -------------------------------------------------------------------------- */

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
  name: string;
  dataKey: string;
  color?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: ChartType;
  data: ChartDataPoint[];
  series: ChartSeries[];
  xAxisKey: string;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
}

/* --------------------------------------------------------------------------
   Table Types
   -------------------------------------------------------------------------- */

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableConfig<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: PaginationState;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
}

/* --------------------------------------------------------------------------
   Filter Types
   -------------------------------------------------------------------------- */

export type DatePreset = 'today' | '7d' | '30d' | '90d' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
  preset?: DatePreset;
}

export interface DashboardFilters {
  dateRange: DateRange;
  categories: string[];
  regions: string[];
  search: string;
  comparison: {
    enabled: boolean;
    period: 'previous' | 'year-ago';
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<DashboardFilters>;
  isDefault?: boolean;
}

/* --------------------------------------------------------------------------
   Widget Types
   -------------------------------------------------------------------------- */

export type WidgetType = 'kpi' | 'chart' | 'table' | 'custom';

export type WidgetStatus = 'loading' | 'success' | 'error' | 'stale';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  /** react-grid-layout position */
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
  /** Widget-specific configuration */
  config?: Record<string, any>;
  /** Whether widget responds to global filters */
  filterable?: boolean;
  /** Whether widget supports export */
  exportable?: boolean;
  /** Data refresh interval override (ms) */
  refreshInterval?: number;
}

export interface WidgetState {
  status: WidgetStatus;
  data: any;
  lastUpdated: number | null;
  error: string | null;
}

/* --------------------------------------------------------------------------
   Dashboard Types
   -------------------------------------------------------------------------- */

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  defaultFilters?: Partial<DashboardFilters>;
}

export interface DashboardState {
  filters: DashboardFilters;
  widgets: WidgetConfig[];
  widgetStates: Record<string, WidgetState>;
  autoRefresh: boolean;
  refreshInterval: number;
  isCustomizing: boolean;
}

/* --------------------------------------------------------------------------
   Transaction / Data Row Types (Sales Domain)
   -------------------------------------------------------------------------- */

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  product: string;
  category: string;
  amount: number;
  quantity: number;
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  region: string;
  salesRep: string;
}

export interface SalesData {
  kpis: KPIData[];
  revenueHistory: ChartDataPoint[];
  productPerformance: ChartDataPoint[];
  categoryBreakdown: ChartDataPoint[];
  transactions: Transaction[];
}

/* --------------------------------------------------------------------------
   Export / Event Types
   -------------------------------------------------------------------------- */

export type ExportFormat = 'pdf' | 'csv' | 'image';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeFilters?: boolean;
  includeTimestamp?: boolean;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// React type is used by ColumnDef.render return type
import type React from 'react';
