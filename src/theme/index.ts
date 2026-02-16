/**
 * Theme System - Public API
 *
 * Import this module to access the theme provider, hook, and utilities.
 * CSS imports should be done via globals.css in your app entry point.
 *
 * Usage:
 *   import { ThemeProvider, useTheme } from './theme';
 *   import './theme/globals.css';
 */

export {
  ThemeProvider,
  useTheme,
  themeInitScript,
  type ThemeMode,
  type ThemeContextType,
  type ThemeProviderProps,
} from '../context/ThemeContext';

/**
 * CSS Custom Property helper for reading token values at runtime.
 * Useful for chart libraries (Recharts, D3) that need JS color values.
 */
export function getTokenValue(tokenName: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
}

/**
 * Retrieve all chart series colors as an array.
 * Returns resolved CSS values for --chart-color-1 through --chart-color-8.
 */
export function getChartColors(count: number = 8): string[] {
  const colors: string[] = [];
  for (let i = 1; i <= count; i++) {
    const value = getTokenValue(`--chart-color-${i}`);
    if (value) colors.push(value);
  }
  return colors;
}

/**
 * Spacing scale as JS values (in pixels) for non-CSS contexts.
 * Based on 8px grid system.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

/**
 * Breakpoints for responsive design.
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
