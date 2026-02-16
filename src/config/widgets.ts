/**
 * Widget Catalog Configuration
 *
 * Central registry of all available widget types, their default configs,
 * and the mapping between widget IDs and data fetchers.
 */

import type { WidgetConfig, WidgetType, ChartType } from '../types/dashboard';

/* --------------------------------------------------------------------------
   Widget Registry
   -------------------------------------------------------------------------- */

export interface WidgetRegistryEntry {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  /** Chart sub-type (line, bar, pie, etc.) */
  chartType?: ChartType;
  /** Default grid layout */
  defaultLayout: { w: number; h: number };
  /** Whether widget responds to global filters */
  filterable: boolean;
  /** Whether widget supports data export */
  exportable: boolean;
  /** Data refresh interval override in ms (0 = use global) */
  refreshInterval: number;
}

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  {
    id: 'kpi-revenue',
    type: 'kpi',
    title: 'Revenue',
    subtitle: 'Total revenue this period',
    defaultLayout: { w: 3, h: 2 },
    filterable: true,
    exportable: false,
    refreshInterval: 0,
  },
  {
    id: 'kpi-orders',
    type: 'kpi',
    title: 'Orders',
    subtitle: 'Total orders placed',
    defaultLayout: { w: 3, h: 2 },
    filterable: true,
    exportable: false,
    refreshInterval: 0,
  },
  {
    id: 'kpi-conversion',
    type: 'kpi',
    title: 'Conversion Rate',
    subtitle: 'Visitor to customer rate',
    defaultLayout: { w: 3, h: 2 },
    filterable: true,
    exportable: false,
    refreshInterval: 0,
  },
  {
    id: 'kpi-aov',
    type: 'kpi',
    title: 'Average Order Value',
    subtitle: 'Mean revenue per order',
    defaultLayout: { w: 3, h: 2 },
    filterable: true,
    exportable: false,
    refreshInterval: 0,
  },
  {
    id: 'chart-revenue-trend',
    type: 'chart',
    title: 'Revenue Trend',
    subtitle: 'Daily revenue over selected period',
    chartType: 'line',
    defaultLayout: { w: 8, h: 4 },
    filterable: true,
    exportable: true,
    refreshInterval: 0,
  },
  {
    id: 'chart-comparison',
    type: 'chart',
    title: 'Product Comparison',
    subtitle: 'Revenue by product',
    chartType: 'bar',
    defaultLayout: { w: 6, h: 4 },
    filterable: true,
    exportable: true,
    refreshInterval: 0,
  },
  {
    id: 'chart-category',
    type: 'chart',
    title: 'Category Breakdown',
    subtitle: 'Sales by category',
    chartType: 'pie',
    defaultLayout: { w: 4, h: 4 },
    filterable: true,
    exportable: true,
    refreshInterval: 0,
  },
  {
    id: 'chart-distribution',
    type: 'chart',
    title: 'Regional Distribution',
    subtitle: 'Sales by region',
    chartType: 'pie',
    defaultLayout: { w: 6, h: 4 },
    filterable: true,
    exportable: true,
    refreshInterval: 0,
  },
  {
    id: 'table-transactions',
    type: 'table',
    title: 'Recent Transactions',
    subtitle: 'Latest orders and transaction details',
    defaultLayout: { w: 12, h: 5 },
    filterable: true,
    exportable: true,
    refreshInterval: 0,
  },
];

/**
 * Look up a widget entry by ID.
 */
export function getWidgetById(id: string): WidgetRegistryEntry | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}

/**
 * Get all widgets of a specific type.
 */
export function getWidgetsByType(type: WidgetType): WidgetRegistryEntry[] {
  return WIDGET_REGISTRY.filter((w) => w.type === type);
}
