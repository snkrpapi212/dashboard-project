/* ==========================================================================
   Components - Barrel Export
   Central export point for all component modules.
   ========================================================================== */

// Provider
export { DashboardAppProvider } from './DashboardProvider';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';

// Widgets
export { KPICard } from './widgets/KPICard';
export { ChartWidget } from './widgets/ChartWidget';
export { TableWidget } from './widgets/TableWidget';

// Charts
export {
  LineChartRenderer,
  AreaChartRenderer,
  BarChartRenderer,
  PieChartRenderer,
  AccessibleChartWrapper,
  ChartTooltip,
  ChartPatternDefs,
} from './charts';

// Table
export { DataTable, transactionColumns, transactionColumnsMobile } from './table';

// Feedback
export {
  ToastProvider,
  useToast,
  ProgressBar,
  CircularProgress,
  EmptyState,
  ConfirmDialog,
  AlertBanner,
  KPICardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  FilterBarSkeleton,
  DashboardSkeleton,
} from './feedback';

// Filters
export { AdvancedFilterPanel } from './filters/AdvancedFilterPanel';

// Layouts
export { CustomizableGrid, SALES_DASHBOARD_LAYOUTS } from './layouts/CustomizableGrid';
export { WidgetCatalog, AVAILABLE_WIDGETS } from './layouts/WidgetCatalog';

// Common
export { WidgetContainer } from './common/WidgetContainer';
