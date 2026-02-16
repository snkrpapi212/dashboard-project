import React from 'react';

/* --------------------------------------------------------------------------
   DashboardContent
   Provides the internal CSS Grid structure for dashboard sections:
   filter bar, KPI cards, chart grid, and data table.
   -------------------------------------------------------------------------- */

export interface DashboardContentProps {
  /** Optional filter bar rendered at the top */
  filterBar?: React.ReactNode;
  /** KPI / metric cards (auto-fit grid) */
  kpiCards?: React.ReactNode;
  /** Chart components (2-col grid on desktop) */
  charts?: React.ReactNode;
  /** Data table section (full width) */
  dataTable?: React.ReactNode;
  /** Any additional sections after the table */
  children?: React.ReactNode;
}

export function DashboardContent({
  filterBar,
  kpiCards,
  charts,
  dataTable,
  children,
}: DashboardContentProps) {
  return (
    <div className="dashboard-grid">
      {filterBar && (
        <section
          className="dashboard-grid__filter-bar"
          aria-label="Dashboard filters"
        >
          {filterBar}
        </section>
      )}

      {kpiCards && (
        <section
          className="dashboard-grid__kpi-row"
          aria-label="Key performance indicators"
        >
          {kpiCards}
        </section>
      )}

      {charts && (
        <section
          className="dashboard-grid__chart-area"
          aria-label="Charts and visualizations"
        >
          {charts}
        </section>
      )}

      {dataTable && (
        <section
          className="dashboard-grid__table-section"
          aria-label="Data table"
        >
          {dataTable}
        </section>
      )}

      {children}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Section Header
   Reusable header for dashboard sections (title + optional actions)
   -------------------------------------------------------------------------- */

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="layout-section__header">
      <div>
        <h2 className="layout-section__title">{title}</h2>
        {subtitle && (
          <p className="layout-section__subtitle">{subtitle}</p>
        )}
      </div>
      {actions && <div className="layout-row layout-row--sm">{actions}</div>}
    </div>
  );
}
