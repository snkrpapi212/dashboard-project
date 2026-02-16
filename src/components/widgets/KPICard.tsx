import React from 'react';
import type { KPIData, KPIStatus } from '../../types/dashboard';
import { formatKPIValue, formatPercentage } from '../../utils/formatters';

/* ==========================================================================
   KPICard Component
   Full-featured KPI card with value, trend, sparkline, comparison,
   status indicator, and icon support.
   Uses dashboard design tokens for consistent styling.
   ========================================================================== */

export interface KPICardProps {
  /** KPI data to display */
  data: KPIData;
  /** Click handler for drill-down */
  onClick?: (kpi: KPIData) => void;
  /** Whether the card is in a loading state */
  loading?: boolean;
  /** Compact mode for smaller viewports */
  compact?: boolean;
}

/* --------------------------------------------------------------------------
   Status Helpers
   -------------------------------------------------------------------------- */

const STATUS_ICON_MAP: Record<KPIStatus, string> = {
  positive: 'kpi-icon--success',
  negative: 'kpi-icon--danger',
  neutral: 'kpi-icon--primary',
  warning: 'kpi-icon--warning',
};

const TREND_ARROW: Record<string, string> = {
  up: '\u2191',   // arrow up
  down: '\u2193', // arrow down
  neutral: '\u2192', // arrow right
};

/* --------------------------------------------------------------------------
   Sparkline Sub-Component
   -------------------------------------------------------------------------- */

interface SparklineProps {
  data: number[];
  status: KPIStatus;
  width?: number;
  height?: number;
}

function Sparkline({ data, status, width = 100, height = 32 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const colorVar =
    status === 'positive'
      ? 'var(--kpi-trend-positive)'
      : status === 'negative'
        ? 'var(--kpi-trend-negative)'
        : 'var(--kpi-trend-neutral)';

  return (
    <svg
      className="kpi-card__sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      role="img"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colorVar}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   KPICard
   -------------------------------------------------------------------------- */

export function KPICard({ data, onClick, loading = false, compact = false }: KPICardProps) {
  const {
    label,
    value,
    trend,
    trendDirection,
    status,
    format,
    sparkline,
    icon,
    comparisonLabel = 'vs last period',
    target,
  } = data;

  if (loading) {
    return <KPICardSkeleton />;
  }

  const trendClass = `kpi-card__trend kpi-card__trend--${status}`;
  const iconClass = `kpi-card__icon ${STATUS_ICON_MAP[status]}`;
  const cardClass = [
    'kpi-card',
    compact ? 'kpi-card--compact' : '',
    onClick ? 'kpi-card--clickable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const formattedValue = formatKPIValue(value, format);
  const formattedTrend = formatPercentage(Math.abs(trend), { showSign: false });
  const progressPercent = target ? Math.min((value / target) * 100, 100) : null;

  return (
    <article
      className={cardClass}
      onClick={onClick ? () => onClick(data) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(data);
              }
            }
          : undefined
      }
      aria-label={`${label}: ${formattedValue}, ${trendDirection} ${formattedTrend}`}
    >
      {/* Header row: label + icon */}
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
        {icon && (
          <span className={iconClass} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {/* Primary metric */}
      <div className="kpi-card__value">{formattedValue}</div>

      {/* Trend indicator */}
      <div className={trendClass}>
        <span className="kpi-card__trend-arrow" aria-hidden="true">
          {TREND_ARROW[trendDirection]}
        </span>
        <span className="kpi-card__trend-value">{formattedTrend}</span>
        <span className="kpi-card__comparison">{comparisonLabel}</span>
      </div>

      {/* Target progress bar */}
      {progressPercent !== null && (
        <div className="kpi-card__progress">
          <div className="kpi-card__progress-bar">
            <div
              className="kpi-card__progress-fill"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="kpi-card__progress-label">
            {progressPercent.toFixed(0)}% of target
          </span>
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <Sparkline data={sparkline} status={status} />
      )}
    </article>
  );
}

/* --------------------------------------------------------------------------
   Skeleton Loader
   -------------------------------------------------------------------------- */

function KPICardSkeleton() {
  return (
    <div className="kpi-card kpi-card--skeleton" aria-busy="true" aria-label="Loading metric">
      <div className="kpi-card__header">
        <span className="skeleton skeleton--text skeleton--w-50" />
        <span className="skeleton skeleton--circle skeleton--sm" />
      </div>
      <div className="skeleton skeleton--text skeleton--w-75 skeleton--lg" />
      <div className="skeleton skeleton--text skeleton--w-40" />
      <div className="skeleton skeleton--rect skeleton--sparkline" />
    </div>
  );
}

export default KPICard;
