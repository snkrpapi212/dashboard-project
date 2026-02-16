import React from 'react';

/* ==========================================================================
   Skeleton Loaders
   Advanced skeleton screen components for dashboard widgets.
   Extends the existing .skeleton CSS class from dashboard.css with
   structured layout skeletons for KPI cards, charts, tables, and filters.
   ========================================================================== */

/**
 * KPI Card Skeleton
 * Mimics the layout of a real KPICard with placeholder blocks.
 */
export function KPICardSkeleton() {
  return (
    <div className="skeleton--kpi-card" aria-busy="true" aria-label="Loading metric">
      <div className="skeleton-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton skeleton--text skeleton--w-40" />
          <div className="skeleton skeleton--circle skeleton--sm" />
        </div>
        <div className="skeleton skeleton--lg skeleton--w-50" />
        <div className="skeleton skeleton--text skeleton--w-30" />
        <div className="skeleton skeleton--sparkline" />
      </div>
    </div>
  );
}

/**
 * Chart Widget Skeleton
 * Mimics a chart area with bar-like shapes.
 */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  const barHeights = [60, 80, 45, 90, 55, 70, 85, 40];

  return (
    <div className="skeleton--chart" aria-busy="true" aria-label="Loading chart">
      <div className="skeleton-group">
        <div className="skeleton skeleton--text skeleton--w-40" />
        <div className="skeleton skeleton--text skeleton--w-30" style={{ opacity: 0.6 }} />
      </div>
      <div className="skeleton--chart-bars" style={{ height }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="skeleton skeleton--chart-bar"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 * Mimics a data table with header row and data rows.
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-widget--skeleton" aria-busy="true" aria-label="Loading table">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div className="skeleton skeleton--lg skeleton--w-30" />
        <div className="skeleton skeleton--text" style={{ width: 80 }} />
      </div>

      {/* Header row */}
      <div className="table-widget__skeleton-rows">
        <div className="table-widget__skeleton-row" style={{ opacity: 0.8 }}>
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="skeleton" style={{ flex: i === 0 ? 2 : 1 }} />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={rowIdx}
            className="table-widget__skeleton-row"
            style={{ opacity: 1 - rowIdx * 0.1 }}
          >
            {Array.from({ length: columns }, (_, colIdx) => (
              <div key={colIdx} className="skeleton" style={{ flex: colIdx === 0 ? 2 : 1 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Filter Bar Skeleton
 * Mimics the advanced filter panel.
 */
export function FilterBarSkeleton() {
  return (
    <div className="skeleton--filter-bar" aria-busy="true" aria-label="Loading filters">
      <div className="skeleton skeleton--filter-item" />
      <div className="skeleton skeleton--filter-item" style={{ width: 120 }} />
      <div className="skeleton skeleton--filter-item" style={{ width: 200 }} />
      <div className="skeleton skeleton--filter-item" style={{ width: 100 }} />
    </div>
  );
}

/**
 * Dashboard Page Skeleton
 * Full page skeleton combining all widget skeletons.
 */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--layout-grid-gap)' }}>
      {/* Filter bar */}
      <FilterBarSkeleton />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--layout-grid-gap)' }}>
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--layout-grid-gap)' }}>
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />
      </div>

      {/* Table */}
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

export default {
  KPICardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  FilterBarSkeleton,
  DashboardSkeleton,
};
