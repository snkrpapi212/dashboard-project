/**
 * useChartColors Hook
 *
 * Provides theme-aware chart colors by reading CSS custom properties.
 * Re-reads colors when theme changes so charts automatically adapt
 * between light/dark/high-contrast modes.
 *
 * Uses the --chart-color-1 through --chart-color-8 design tokens
 * and the getChartColors() helper from the theme system.
 */

import { useState, useEffect, useCallback } from 'react';
import { getChartColors, getTokenValue } from '../theme';

export interface ChartColorSet {
  /** Ordered array of series colors (resolved CSS values) */
  colors: string[];
  /** Get a specific color by index (wraps around) */
  getColor: (index: number) => string;
  /** Chart grid line color */
  gridColor: string;
  /** Chart axis line color */
  axisColor: string;
  /** Chart axis text color */
  axisTextColor: string;
  /** Tooltip background color */
  tooltipBg: string;
  /** Tooltip text color */
  tooltipText: string;
  /** Card background (for pie stroke separation) */
  cardBg: string;
}

/** Fallback colors matching the light-mode design tokens */
const FALLBACK_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export function useChartColors(count: number = 8): ChartColorSet {
  const [colorSet, setColorSet] = useState<ChartColorSet>(() =>
    buildColorSet(count),
  );

  // Re-read colors when the theme attribute changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Small delay to let CSS variables resolve after theme switch
      requestAnimationFrame(() => {
        setColorSet(buildColorSet(count));
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Also set initial
    setColorSet(buildColorSet(count));

    return () => observer.disconnect();
  }, [count]);

  return colorSet;
}

function buildColorSet(count: number): ChartColorSet {
  const resolved = getChartColors(count);
  const colors =
    resolved.length >= count ? resolved : [...resolved, ...FALLBACK_COLORS].slice(0, count);

  const getColor = (index: number) => colors[index % colors.length];

  return {
    colors,
    getColor,
    gridColor: getTokenValue('--chart-grid-color') || '#f3f4f6',
    axisColor: getTokenValue('--chart-axis-color') || '#d1d5db',
    axisTextColor: getTokenValue('--chart-axis-text-color') || '#9ca3af',
    tooltipBg: getTokenValue('--chart-tooltip-bg') || '#111827',
    tooltipText: getTokenValue('--chart-tooltip-text') || '#ffffff',
    cardBg: getTokenValue('--card-bg') || '#ffffff',
  };
}

export default useChartColors;
