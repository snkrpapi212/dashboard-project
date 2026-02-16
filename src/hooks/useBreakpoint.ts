import { useMediaQuery } from './useMediaQuery';

/**
 * Breakpoint values matching the design token system.
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Returns the current active breakpoint name based on viewport width.
 *
 * @example
 *   const bp = useBreakpoint();
 *   // bp === 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export function useBreakpoint(): BreakpointKey | 'xs' {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

/**
 * Returns true when the viewport is at or above the given breakpoint.
 *
 * @example
 *   const isDesktop = useBreakpointUp('lg');
 */
export function useBreakpointUp(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

/**
 * Returns true when the viewport is below the given breakpoint.
 *
 * @example
 *   const isMobile = useBreakpointDown('md');
 */
export function useBreakpointDown(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
}
