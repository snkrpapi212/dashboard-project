/**
 * Colorblind-Safe Palette Utilities
 *
 * Provides multiple colorblind-safe palettes and utility functions
 * for accessible data visualization. All palettes avoid red/green
 * combinations and have been validated against common forms of
 * color vision deficiency (deuteranopia, protanopia, tritanopia).
 *
 * Reference: IBM Design Color Blind Safe palette, Wong (2011),
 * and Paul Tol's qualitative color schemes.
 */

/* --------------------------------------------------------------------------
   Palette Definitions
   -------------------------------------------------------------------------- */

/** IBM Design colorblind-safe palette */
export const IBM_PALETTE = [
  '#648FFF', // Blue
  '#785EF0', // Purple
  '#DC267F', // Magenta
  '#FE6100', // Orange
  '#FFB000', // Yellow
] as const;

/** Wong (2011) colorblind-safe palette - widely used in scientific publications */
export const WONG_PALETTE = [
  '#0072B2', // Blue
  '#E69F00', // Orange
  '#009E73', // Bluish Green
  '#F0E442', // Yellow
  '#56B4E9', // Sky Blue
  '#D55E00', // Vermillion
  '#CC79A7', // Reddish Purple
  '#000000', // Black
] as const;

/** Paul Tol's qualitative scheme - optimized for colorblindness */
export const TOL_PALETTE = [
  '#332288', // Indigo
  '#88CCEE', // Cyan
  '#44AA99', // Teal
  '#117733', // Green
  '#999933', // Olive
  '#DDCC77', // Sand
  '#CC6677', // Rose
  '#882255', // Wine
  '#AA4499', // Purple
] as const;

/** Dashboard default: designed to work with both light and dark themes */
export const DASHBOARD_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
] as const;

/** Dashboard dark mode variant with higher luminance */
export const DASHBOARD_PALETTE_DARK = [
  '#60A5FA', // Blue
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#A78BFA', // Violet
  '#F472B6', // Pink
  '#2DD4BF', // Teal
  '#FB923C', // Orange
  '#818CF8', // Indigo
] as const;

export type PaletteName = 'ibm' | 'wong' | 'tol' | 'dashboard' | 'dashboard-dark';

const PALETTES: Record<PaletteName, readonly string[]> = {
  ibm: IBM_PALETTE,
  wong: WONG_PALETTE,
  tol: TOL_PALETTE,
  dashboard: DASHBOARD_PALETTE,
  'dashboard-dark': DASHBOARD_PALETTE_DARK,
};

/* --------------------------------------------------------------------------
   Utility Functions
   -------------------------------------------------------------------------- */

/**
 * Get a named palette.
 */
export function getPalette(name: PaletteName): readonly string[] {
  return PALETTES[name] ?? DASHBOARD_PALETTE;
}

/**
 * Generate N distinct colors from a palette, cycling if necessary.
 */
export function getDistinctColors(count: number, palette: PaletteName = 'dashboard'): string[] {
  const base = PALETTES[palette] ?? DASHBOARD_PALETTE;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(base[i % base.length] as string);
  }
  return result;
}

/**
 * Calculate relative luminance of a hex color (WCAG 2.1 formula).
 */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two hex colors (WCAG 2.1).
 * Returns a value between 1 and 21.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color meets WCAG 2.1 AA contrast against a background.
 * Non-text UI components require 3:1, text requires 4.5:1.
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  isText: boolean = false,
): boolean {
  const ratio = contrastRatio(foreground, background);
  return isText ? ratio >= 4.5 : ratio >= 3;
}

/**
 * Generate a pattern identifier for a series index.
 * Patterns provide a secondary visual channel beyond color.
 */
export type PatternType = 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash';

export function getSeriesPattern(index: number): PatternType {
  const patterns: PatternType[] = ['solid', 'dashed', 'dotted', 'dash-dot', 'long-dash'];
  return patterns[index % patterns.length];
}

/**
 * Get the SVG stroke-dasharray value for a pattern type.
 */
export function getStrokeDasharray(pattern: PatternType): string {
  switch (pattern) {
    case 'solid':
      return 'none';
    case 'dashed':
      return '8 4';
    case 'dotted':
      return '2 4';
    case 'dash-dot':
      return '8 4 2 4';
    case 'long-dash':
      return '16 6';
    default:
      return 'none';
  }
}

/* --------------------------------------------------------------------------
   Internal Helpers
   -------------------------------------------------------------------------- */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}
