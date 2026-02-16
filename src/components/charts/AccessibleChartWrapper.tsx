/**
 * AccessibleChartWrapper
 *
 * WCAG 2.1 AA compliant wrapper for all chart components. Provides:
 * - Semantic HTML structure with role="img" and aria-label
 * - A visually-hidden data table fallback for screen readers
 * - Keyboard navigation support
 * - Reduced-motion detection for disabling animations
 * - Announces data updates via aria-live region
 *
 * Usage:
 *   <AccessibleChartWrapper
 *     title="Revenue Trend"
 *     description="Monthly revenue from Jan to Dec 2025"
 *     data={chartData}
 *     columns={['Month', 'Revenue', 'Target']}
 *     dataKeys={['month', 'revenue', 'target']}
 *   >
 *     <LineChart ... />
 *   </AccessibleChartWrapper>
 */

import React, { useId, useState, useCallback, useEffect } from 'react';

export interface AccessibleChartWrapperProps {
  /** Accessible label describing the chart */
  title: string;
  /** Extended description of what the chart shows */
  description?: string;
  /** Raw chart data for the data table fallback */
  data: Record<string, any>[];
  /** Column headers for the data table */
  columns: string[];
  /** Data keys matching the columns */
  dataKeys: string[];
  /** Value formatter per column (optional) */
  formatters?: Record<string, (value: any) => string>;
  /** Chart content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Whether to show the data table toggle button */
  showTableToggle?: boolean;
}

export function AccessibleChartWrapper({
  title,
  description,
  data,
  columns,
  dataKeys,
  formatters = {},
  children,
  className = '',
  showTableToggle = true,
}: AccessibleChartWrapperProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  const tableId = `${id}-table`;
  const liveId = `${id}-live`;

  const [showTable, setShowTable] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTable = useCallback(() => {
    setShowTable((prev) => !prev);
  }, []);

  const formatValue = useCallback(
    (key: string, value: any) => {
      if (formatters[key]) {
        return formatters[key](value);
      }
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value ?? '');
    },
    [formatters],
  );

  return (
    <figure
      className={`accessible-chart ${className}`.trim()}
      role="img"
      aria-labelledby={labelId}
      aria-describedby={description ? descId : undefined}
      data-reduced-motion={prefersReducedMotion ? 'true' : undefined}
    >
      {/* Visually hidden label for screen readers */}
      <figcaption className="sr-only" id={labelId}>
        {title}
      </figcaption>

      {description && (
        <p className="sr-only" id={descId}>
          {description}
        </p>
      )}

      {/* Live region for dynamic data updates */}
      <div
        id={liveId}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {title}: {data.length} data points
      </div>

      {/* Chart visualization */}
      <div className="accessible-chart__visual">
        {children}
      </div>

      {/* Data table toggle */}
      {showTableToggle && (
        <div className="accessible-chart__controls">
          <button
            className="accessible-chart__table-toggle"
            onClick={toggleTable}
            aria-expanded={showTable}
            aria-controls={tableId}
          >
            {showTable ? 'Hide data table' : 'Show data table'}
          </button>
        </div>
      )}

      {/* Accessible data table fallback */}
      {showTable && (
        <div className="accessible-chart__table-container" id={tableId}>
          <table className="accessible-chart__table" role="table">
            <caption className="sr-only">{title} - Data Table</caption>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {dataKeys.map((key, colIdx) => (
                    <td key={colIdx}>{formatValue(key, row[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

export default AccessibleChartWrapper;
