import React, { useState, useCallback } from 'react';
import type { ChartConfig, ChartType, ExportFormat } from '../../types/dashboard';
import { LineChartRenderer } from '../charts/LineChartRenderer';
import { AreaChartRenderer } from '../charts/AreaChartRenderer';
import { BarChartRenderer } from '../charts/BarChartRenderer';
import { PieChartRenderer } from '../charts/PieChartRenderer';
import type { TooltipFormatType } from '../charts/ChartTooltip';

/* ==========================================================================
   ChartWidget Component
   Multi-type chart widget (AreaChart, BarChart, LineChart, Pie) with
   loading/error states, chart type switching, and export capability.

   Renders real Recharts visualizations via dedicated chart renderers,
   with theme-aware colors, WCAG 2.1 AA accessibility, and
   colorblind-safe palettes.
   ========================================================================== */

export interface ChartWidgetProps {
  /** Chart configuration */
  config: ChartConfig;
  /** Whether data is loading */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Available chart types the user can switch between */
  allowedTypes?: ChartType[];
  /** Export handler */
  onExport?: (format: ExportFormat) => void;
  /** Retry handler for error state */
  onRetry?: () => void;
  /** Full-width spanning */
  fullWidth?: boolean;
  /** Chart height in pixels */
  height?: number;
  /** Tooltip value format type */
  formatType?: TooltipFormatType;
  /** Custom value formatter for tooltips and axes */
  valueFormatter?: (value: number) => string;
  /** Custom label formatter for tooltip headers */
  labelFormatter?: (label: string) => string;
  /** Click handler for data interactions */
  onDataClick?: (data: any, index: number) => void;
}

export function ChartWidget({
  config,
  loading = false,
  error = null,
  allowedTypes = ['line', 'bar', 'area'],
  onExport,
  onRetry,
  fullWidth = false,
  height = 300,
  formatType = 'default',
  valueFormatter,
  labelFormatter,
  onDataClick,
}: ChartWidgetProps) {
  const [activeType, setActiveType] = useState<ChartType>(config.type);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const cardClass = [
    'chart-widget',
    fullWidth ? 'chart-card--full-width' : 'chart-card--half-width',
  ]
    .filter(Boolean)
    .join(' ');

  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExport?.(format);
      setShowExportMenu(false);
    },
    [onExport],
  );

  return (
    <div className={cardClass}>
      {/* Widget header */}
      <div className="chart-widget__header">
        <div className="chart-widget__title-group">
          <h3 className="chart-widget__title">{config.title}</h3>
          {config.subtitle && (
            <p className="chart-widget__subtitle">{config.subtitle}</p>
          )}
        </div>

        <div className="chart-widget__actions">
          {/* Chart type switcher */}
          {allowedTypes.length > 1 && (
            <div className="chart-widget__type-switcher" role="radiogroup" aria-label="Chart type">
              {allowedTypes.map((type) => (
                <button
                  key={type}
                  className={`chart-widget__type-btn ${activeType === type ? 'chart-widget__type-btn--active' : ''}`}
                  onClick={() => setActiveType(type)}
                  role="radio"
                  aria-checked={activeType === type}
                  title={`${type} chart`}
                >
                  {chartTypeIcon(type)}
                </button>
              ))}
            </div>
          )}

          {/* Export menu */}
          {onExport && (
            <div className="chart-widget__export-wrapper">
              <button
                className="chart-widget__action-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                aria-haspopup="menu"
                aria-expanded={showExportMenu}
                title="Export chart"
              >
                <ExportIcon />
              </button>
              {showExportMenu && (
                <div className="chart-widget__export-menu" role="menu">
                  <button role="menuitem" onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </button>
                  <button role="menuitem" onClick={() => handleExport('csv')}>
                    Export as CSV
                  </button>
                  <button role="menuitem" onClick={() => handleExport('image')}>
                    Export as Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart body */}
      <div
        className="chart-widget__body"
        style={{ height: `${height}px` }}
        aria-label={`${config.title} chart`}
      >
        {loading && <ChartSkeleton height={height} />}

        {error && (
          <div className="chart-widget__error" role="alert">
            <span className="chart-widget__error-icon" aria-hidden="true">!</span>
            <p className="chart-widget__error-message">Failed to load chart data</p>
            <p className="chart-widget__error-detail">{error}</p>
            {onRetry && (
              <button className="chart-widget__retry-btn" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <ChartRenderer
            type={activeType}
            config={config}
            height={height}
            formatType={formatType}
            valueFormatter={valueFormatter || config.valueFormatter}
            labelFormatter={labelFormatter}
            onDataClick={onDataClick}
          />
        )}
      </div>

      {/* Legend - handled internally by Recharts renderers, but keep widget
          legend for non-chart states or when chart legend is disabled */}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Chart Renderer - Routes to the correct Recharts component
   -------------------------------------------------------------------------- */

interface ChartRendererProps {
  type: ChartType;
  config: ChartConfig;
  height: number;
  formatType?: TooltipFormatType;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  onDataClick?: (data: any, index: number) => void;
}

function ChartRenderer({
  type,
  config,
  height,
  formatType,
  valueFormatter,
  labelFormatter,
  onDataClick,
}: ChartRendererProps) {
  if (!config.data || config.data.length === 0) {
    return (
      <div className="chart-widget__empty">
        <p>No data available for the selected period.</p>
      </div>
    );
  }

  const commonProps = {
    data: config.data,
    series: config.series,
    height: height,
    showGrid: config.showGrid !== false,
    showLegend: config.showLegend !== false,
    formatType: formatType,
    valueFormatter: valueFormatter,
    labelFormatter: labelFormatter,
    title: config.title,
    description: config.subtitle,
    animate: true,
  };

  switch (type) {
    case 'line':
      return (
        <LineChartRenderer
          {...commonProps}
          xAxisKey={config.xAxisKey}
          onDataPointClick={onDataClick}
          usePatterns={config.series.length > 1}
        />
      );

    case 'area':
      return (
        <AreaChartRenderer
          {...commonProps}
          xAxisKey={config.xAxisKey}
          onDataPointClick={onDataClick}
        />
      );

    case 'bar':
      return (
        <BarChartRenderer
          {...commonProps}
          xAxisKey={config.xAxisKey}
          onBarClick={onDataClick ? (data, index) => onDataClick(data, index) : undefined}
        />
      );

    case 'pie':
    case 'donut':
      return (
        <PieChartRenderer
          {...commonProps}
          labelKey={config.xAxisKey}
          donut={type === 'donut'}
          onSliceClick={onDataClick}
        />
      );

    default:
      return (
        <LineChartRenderer
          {...commonProps}
          xAxisKey={config.xAxisKey}
          onDataPointClick={onDataClick}
        />
      );
  }
}

/* --------------------------------------------------------------------------
   Skeleton
   -------------------------------------------------------------------------- */

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="chart-widget__skeleton"
      style={{ height: `${height}px` }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      <div className="skeleton skeleton--rect" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Icons
   -------------------------------------------------------------------------- */

function chartTypeIcon(type: ChartType): string {
  switch (type) {
    case 'line': return '\u2571'; // diagonal
    case 'area': return '\u25B3'; // triangle
    case 'bar': return '\u2503'; // vertical bar
    case 'pie':
    case 'donut': return '\u25CB'; // circle
    default: return '\u2571';
  }
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1v9M4 6l4-4 4 4M2 11v2a2 2 0 002 2h8a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ChartWidget;
