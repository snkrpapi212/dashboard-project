/* ==========================================================================
   Number & Data Formatting Utilities
   Consistent formatting for KPI values, currencies, percentages, etc.
   ========================================================================== */

/**
 * Format a large number with abbreviated suffixes (K, M, B).
 * @example formatLargeNumber(1245832) => "1.25M"
 */
export function formatLargeNumber(value: number, decimals = 2): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
  }
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format a number as currency (USD by default).
 * @example formatCurrency(1245832) => "$1,245,832"
 */
export function formatCurrency(
  value: number,
  options: { currency?: string; compact?: boolean; decimals?: number } = {},
): string {
  const { currency = 'USD', compact = false, decimals } = options;

  if (compact) {
    const prefix = currency === 'USD' ? '$' : '';
    return `${prefix}${formatLargeNumber(value, decimals ?? 1)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(value);
}

/**
 * Format a number as a percentage.
 * @example formatPercentage(15.3) => "+15.3%"
 */
export function formatPercentage(
  value: number,
  options: { showSign?: boolean; decimals?: number } = {},
): string {
  const { showSign = false, decimals = 1 } = options;
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format a number with locale-aware thousands separators.
 * @example formatNumber(3421) => "3,421"
 */
export function formatNumber(
  value: number,
  options: { decimals?: number; compact?: boolean } = {},
): string {
  const { decimals = 0, compact = false } = options;

  if (compact) {
    return formatLargeNumber(value, decimals);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a decimal value (e.g., AOV).
 * @example formatDecimal(64.32) => "64.32"
 */
export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format a date string for display.
 * @example formatDate("2026-02-15") => "Feb 15, 2026"
 */
export function formatDate(
  dateString: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium',
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  }[format] as Intl.DateTimeFormatOptions;

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a KPI value based on its format type.
 */
export function formatKPIValue(
  value: number,
  format: 'currency' | 'number' | 'percentage' | 'decimal',
  compact = true,
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value, { compact });
    case 'percentage':
      return formatPercentage(value);
    case 'decimal':
      return formatDecimal(value);
    case 'number':
    default:
      return formatNumber(value, { compact });
  }
}

/**
 * Get relative time string.
 * @example getRelativeTime(Date.now() - 60000) => "1 minute ago"
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
