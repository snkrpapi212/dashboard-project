/**
 * ChartTooltip
 *
 * Custom tooltip component for Recharts that uses design tokens
 * for consistent styling across light and dark themes.
 * Supports currency, number, and percentage formatting.
 */

import React from 'react';
import type { TooltipProps } from 'recharts';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

export type TooltipFormatType = 'currency' | 'number' | 'percentage' | 'default';

export interface ChartTooltipProps extends TooltipProps<number, string> {
  /** Format type applied to values */
  formatType?: TooltipFormatType;
  /** Custom value formatter (overrides formatType) */
  valueFormatter?: (value: number) => string;
  /** Custom label formatter for the header line */
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatType = 'default',
  valueFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(String(label)) : String(label);

  return (
    <div className="recharts-custom-tooltip" role="tooltip">
      <p className="recharts-custom-tooltip__label">{formattedLabel}</p>
      <ul className="recharts-custom-tooltip__list">
        {payload.map((entry, index) => {
          const value = entry.value as number;
          const formattedValue = valueFormatter
            ? valueFormatter(value)
            : formatByType(value, formatType);

          return (
            <li key={index} className="recharts-custom-tooltip__item">
              <span
                className="recharts-custom-tooltip__dot"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="recharts-custom-tooltip__name">{entry.name}</span>
              <span className="recharts-custom-tooltip__value">{formattedValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatByType(value: number, type: TooltipFormatType): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'number':
      return formatNumber(value);
    case 'percentage':
      return formatPercentage(value);
    default:
      return typeof value === 'number' ? value.toLocaleString() : String(value);
  }
}

export default ChartTooltip;
