import React, { useState, useCallback, useRef, useMemo } from 'react';
import { DashboardLayout, DashboardContent, SectionHeader } from '../layouts';
import { DashboardAppProvider } from '../components/DashboardProvider';
import { useDashboard } from '../hooks/useDashboard';
import { KPICard } from '../components/widgets/KPICard';
import { ChartWidget } from '../components/widgets/ChartWidget';
import { DataTable } from '../components/table/DataTable';
import {
  transactionColumns,
  transactionColumnsMobile,
} from '../components/table/transactionColumns';
import { AdvancedFilterPanel } from '../components/filters/AdvancedFilterPanel';
import { CustomizableGrid, SALES_DASHBOARD_LAYOUTS } from '../components/layouts/CustomizableGrid';
import { WidgetCatalog, AVAILABLE_WIDGETS } from '../components/layouts/WidgetCatalog';
import { WidgetContainer } from '../components/common/WidgetContainer';
import { useSmartPolling } from '../hooks/useSmartPolling';
import { useCachedWidget } from '../hooks/useCachedWidget';
import { exportDashboard } from '../utils/exportDashboard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTheme } from '../theme';
import {
  ConfirmDialog,
  ProgressBar,
  CircularProgress,
  EmptyState,
  DashboardSkeleton,
} from '../components/feedback';
import { useDashboardFeedback } from '../hooks/useDashboardFeedback';
import type {
  KPIData,
  ChartConfig,
  Transaction,
  ExportFormat,
} from '../types/dashboard';
import { generateMockSalesData } from './mockData';

/* ==========================================================================
   Sales Dashboard Page
   The main dashboard page that assembles all widgets, filters, and layouts.
   ========================================================================== */

export function SalesDashboardPage() {
  return (
    <DashboardAppProvider defaultAutoRefresh defaultRefreshInterval={30_000}>
      <SalesDashboardInner />
    </DashboardAppProvider>
  );
}

/* --------------------------------------------------------------------------
   Navigation Items
   -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', href: '/', icon: '\u25A0' },
  { id: 'revenue', label: 'Revenue', href: '/revenue', icon: '$' },
  { id: 'orders', label: 'Orders', href: '/orders', icon: '#' },
  { id: 'products', label: 'Products', href: '/products', icon: '\u25CB' },
  { id: 'customers', label: 'Customers', href: '/customers', icon: '\u263A' },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: '\u2261',
    children: [
      { id: 'daily', label: 'Daily Report', href: '/reports/daily' },
      { id: 'weekly', label: 'Weekly Report', href: '/reports/weekly' },
      { id: 'monthly', label: 'Monthly Report', href: '/reports/monthly' },
    ],
  },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '\u2699' },
];

/* --------------------------------------------------------------------------
   Inner Dashboard (consumes context)
   -------------------------------------------------------------------------- */

function SalesDashboardInner() {
  const { filters, autoRefresh, refreshInterval, triggerRefresh } = useDashboard();
  const { toggleTheme, isDark } = useTheme();
  const {
    exportProgress,
    handleExportWithFeedback,
    handleRefreshWithFeedback,
    handleBulkAction,
    confirmDialog,
    showConfirmation,
    closeConfirmation,
  } = useDashboardFeedback();

  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activePath, setActivePath] = useState('/');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetCatalog, setShowWidgetCatalog] = useState(false);
  const [activeWidgetIds, setActiveWidgetIds] = useState(
    AVAILABLE_WIDGETS.map((w) => w.id),
  );

  // Fetch data with smart polling (tab visibility aware)
  const { data: salesData } = useSmartPolling(
    () => generateMockSalesData(filters),
    {
      interval: refreshInterval,
      enabled: autoRefresh,
      pauseOnHidden: true,
      immediate: true,
    },
  );

  // Extract data
  const kpis = salesData?.kpis ?? [];
  const revenueHistory = salesData?.revenueHistory ?? [];
  const productPerformance = salesData?.productPerformance ?? [];
  const categoryBreakdown = salesData?.categoryBreakdown ?? [];
  const transactions = salesData?.transactions ?? [];

  // Chart configs
  const revenueTrendConfig: ChartConfig = {
    id: 'chart-revenue-trend',
    title: 'Revenue Trend',
    subtitle: 'Daily revenue over selected period',
    type: 'line',
    data: revenueHistory,
    series: [
      { name: 'Revenue', dataKey: 'revenue' },
      { name: 'Target', dataKey: 'target', color: 'var(--chart-color-4)' },
    ],
    xAxisKey: 'date',
    showLegend: true,
    showGrid: true,
  };

  const comparisonConfig: ChartConfig = {
    id: 'chart-comparison',
    title: 'Product Comparison',
    subtitle: 'Revenue by product',
    type: 'bar',
    data: productPerformance,
    series: [
      { name: 'Revenue', dataKey: 'revenue' },
      { name: 'Units', dataKey: 'units' },
    ],
    xAxisKey: 'product',
    showLegend: true,
  };

  const categoryConfig: ChartConfig = {
    id: 'chart-category',
    title: 'Category Breakdown',
    subtitle: 'Sales distribution by category',
    type: 'pie',
    data: categoryBreakdown,
    series: [{ name: 'Sales', dataKey: 'sales' }],
    xAxisKey: 'category',
    showLegend: true,
  };

  const distributionConfig: ChartConfig = {
    id: 'chart-distribution',
    title: 'Regional Distribution',
    subtitle: 'Sales by region',
    type: 'pie',
    data: salesData?.regionData ?? [],
    series: [{ name: 'Revenue', dataKey: 'revenue' }],
    xAxisKey: 'region',
    showLegend: true,
  };

  // Batch action handler for selected table rows with feedback
  const handleTableBatchAction = useCallback(
    (action: string, rows: Transaction[]) => {
      if (action === 'delete') {
        showConfirmation({
          title: 'Delete selected transactions',
          description: `Are you sure you want to delete ${rows.length} transaction${rows.length > 1 ? 's' : ''}? This action cannot be undone.`,
          variant: 'danger',
          confirmLabel: 'Delete',
          onConfirm: () => {
            // In production, this would trigger API calls
            console.log(`Deleting ${rows.length} rows`, rows);
            handleBulkAction('Deleted', rows.length);
          },
        });
      } else {
        // Non-destructive actions proceed immediately
        console.log(`Batch action "${action}" on ${rows.length} rows`, rows);
        handleBulkAction(action, rows.length);
      }
    },
    [showConfirmation, handleBulkAction],
  );

  // Export handler with progress feedback
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      await handleExportWithFeedback(format, async () => {
        await exportDashboard(format, {
          element: dashboardRef.current,
          data: transactions,
          filename: 'sales-dashboard',
          includeTimestamp: true,
        });
      });
    },
    [transactions, handleExportWithFeedback],
  );

  // Widget catalog handlers
  const handleAddWidget = useCallback(
    (widget: { id: string }) => {
      if (!activeWidgetIds.includes(widget.id)) {
        setActiveWidgetIds((prev) => [...prev, widget.id]);
      }
    },
    [activeWidgetIds],
  );

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setActiveWidgetIds((prev) => prev.filter((id) => id !== widgetId));
  }, []);

  // Header right section
  const headerRight = (
    <div className="layout-row layout-row--sm">
      <button
        className="chart-widget__action-btn"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {isDark ? '\u2600' : '\u263D'}
      </button>
      <button
        className="chart-widget__action-btn"
        onClick={() => setIsCustomizing(!isCustomizing)}
        title={isCustomizing ? 'Exit customization' : 'Customize dashboard'}
        aria-label="Toggle customization mode"
      >
        {isCustomizing ? '\u2713' : '\u270E'}
      </button>
      <button
        className="chart-widget__action-btn"
        onClick={() => setShowWidgetCatalog(!showWidgetCatalog)}
        title="Widget catalog"
        aria-label="Open widget catalog"
      >
        +
      </button>
      <button
        className="filter-panel__apply-btn"
        onClick={() => handleRefreshWithFeedback(triggerRefresh)}
        title="Refresh data"
      >
        Refresh
      </button>
    </div>
  );

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      headerRight={headerRight}
      title="Sales Dashboard"
      activePath={activePath}
      onNavigate={setActivePath}
    >
      <div ref={dashboardRef}>
        <DashboardContent
          filterBar={<AdvancedFilterPanel />}
          kpiCards={
            <>
              {kpis.map((kpi) =>
                activeWidgetIds.includes(`kpi-${kpi.id}`) ? (
                  <KPICard key={kpi.id} data={kpi} />
                ) : null,
              )}
            </>
          }
          charts={
            <>
              {activeWidgetIds.includes('chart-revenue-trend') && (
                <ChartWidget
                  config={revenueTrendConfig}
                  onExport={handleExport}
                  fullWidth
                  allowedTypes={['line', 'area']}
                  formatType="currency"
                  height={320}
                />
              )}
              {activeWidgetIds.includes('chart-comparison') && (
                <ChartWidget
                  config={comparisonConfig}
                  onExport={handleExport}
                  allowedTypes={['bar']}
                  formatType="currency"
                  height={320}
                />
              )}
              {activeWidgetIds.includes('chart-category') && (
                <ChartWidget
                  config={categoryConfig}
                  onExport={handleExport}
                  allowedTypes={['pie']}
                  formatType="currency"
                  height={320}
                />
              )}
              {activeWidgetIds.includes('chart-distribution') && (
                <ChartWidget
                  config={distributionConfig}
                  onExport={handleExport}
                  allowedTypes={['pie']}
                  formatType="currency"
                  height={320}
                />
              )}
            </>
          }
          dataTable={
            activeWidgetIds.includes('table-transactions') ? (
              <DataTable<Transaction>
                title="Recent Transactions"
                subtitle={`${transactions.length} transactions in selected period`}
                columns={transactionColumns}
                data={transactions}
                enableSorting
                enableMultiSort
                enableColumnFilters
                enableGlobalFilter
                enableRowSelection
                enableExport
                enablePagination
                initialPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                getRowId={(row) => row.id}
                onRowClick={(row) => console.log('Row clicked:', row)}
                onBatchAction={handleTableBatchAction}
                batchActions={[
                  { id: 'export-selected', label: 'Export Selected' },
                  { id: 'mark-reviewed', label: 'Mark Reviewed' },
                  { id: 'delete', label: 'Delete', variant: 'danger' },
                ]}
                exportFilename="sales-transactions"
                mobileHiddenColumns={transactionColumnsMobile}
                striped
              />
            ) : null
          }
        />
      </div>

      {/* Export Progress Indicator */}
      {exportProgress.isExporting && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1080,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: 240,
        }}>
          <CircularProgress
            value={exportProgress.progress}
            size="sm"
            indeterminate={exportProgress.progress < 5}
            showLabel={false}
          />
          <ProgressBar
            value={exportProgress.progress}
            size="sm"
            label={`Exporting ${exportProgress.format?.toUpperCase() ?? ''}...`}
            showValue
          />
        </div>
      )}

      {/* Confirmation Dialog (for destructive actions) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmation}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Widget Catalog Overlay */}
      {showWidgetCatalog && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 1060 }}>
          <WidgetCatalog
            activeWidgetIds={activeWidgetIds}
            onAddWidget={handleAddWidget}
            onRemoveWidget={handleRemoveWidget}
            isOpen={showWidgetCatalog}
            onClose={() => setShowWidgetCatalog(false)}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default SalesDashboardPage;
