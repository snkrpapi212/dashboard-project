/* ==========================================================================
   useVirtualScroll Hook
   Lightweight virtual scrolling for large datasets (1000+ rows).
   Renders only visible rows plus overscan buffer for smooth scrolling.
   ========================================================================== */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export interface VirtualScrollOptions {
  /** Total number of items */
  count: number;
  /** Estimated row height in px */
  estimateSize: number;
  /** Number of extra rows to render above/below viewport */
  overscan?: number;
  /** Container height in px */
  containerHeight: number;
  /** Whether virtual scrolling is enabled */
  enabled: boolean;
}

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export interface UseVirtualScrollReturn {
  /** Virtual rows to render */
  virtualRows: VirtualItem[];
  /** Total height of all items (for scroll area) */
  totalHeight: number;
  /** Ref to attach to the scroll container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Row height used */
  rowHeight: number;
}

export function useVirtualScroll(options: VirtualScrollOptions): UseVirtualScrollReturn {
  const { count, estimateSize, overscan = 10, containerHeight, enabled } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Total height of all items
  const totalHeight = count * estimateSize;

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, enabled]);

  // Calculate visible items
  const virtualRows = useMemo<VirtualItem[]>(() => {
    if (!enabled || count === 0) return [];

    const startIndex = Math.max(0, Math.floor(scrollTop / estimateSize) - overscan);
    const visibleCount = Math.ceil(containerHeight / estimateSize);
    const endIndex = Math.min(count - 1, startIndex + visibleCount + overscan * 2);

    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        start: i * estimateSize,
        end: (i + 1) * estimateSize,
        size: estimateSize,
      });
    }

    return items;
  }, [count, estimateSize, overscan, containerHeight, scrollTop, enabled]);

  return {
    virtualRows,
    totalHeight,
    containerRef,
    rowHeight: estimateSize,
  };
}
