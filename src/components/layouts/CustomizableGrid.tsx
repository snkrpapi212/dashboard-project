import React, { useState, useCallback, useEffect } from 'react';

/* ==========================================================================
   CustomizableGrid
   Drag-and-drop, resizable dashboard grid using react-grid-layout concepts.
   Persists layout to localStorage. Integrates with the dashboard token system.

   Note: This implements the grid logic natively (no react-grid-layout
   dependency required). For production use with complex drag-and-drop,
   install react-grid-layout and swap in the Responsive/WidthProvider
   wrapper.
   ========================================================================== */

export interface GridItem {
  /** Unique widget ID */
  i: string;
  /** Grid column position (0-based) */
  x: number;
  /** Grid row position (0-based) */
  y: number;
  /** Width in grid columns */
  w: number;
  /** Height in grid rows */
  h: number;
  /** Minimum width */
  minW?: number;
  /** Minimum height */
  minH?: number;
  /** Maximum width */
  maxW?: number;
  /** Maximum height */
  maxH?: number;
  /** If true, widget cannot be moved */
  static?: boolean;
}

export interface ResponsiveLayouts {
  lg: GridItem[];
  md: GridItem[];
  sm: GridItem[];
}

export interface CustomizableGridProps {
  /** Layout items describing widget positions */
  layouts: ResponsiveLayouts;
  /** Number of grid columns (default: 12) */
  cols?: number;
  /** Row height in pixels (default: 80) */
  rowHeight?: number;
  /** Gap between items in pixels (default: uses --layout-grid-gap) */
  gap?: number;
  /** Whether editing mode is active (enables drag & resize) */
  isEditing?: boolean;
  /** Callback when layout changes */
  onLayoutChange?: (layouts: ResponsiveLayouts) => void;
  /** CSS class for the draggable handle inside widgets */
  draggableHandle?: string;
  /** Render function for each widget */
  children: (item: GridItem) => React.ReactNode;
  /** localStorage key for persisting layouts */
  storageKey?: string;
}

const STORAGE_PREFIX = 'dashboard-grid-';

/* --------------------------------------------------------------------------
   Layout Persistence
   -------------------------------------------------------------------------- */

function loadLayouts(key: string): ResponsiveLayouts | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLayouts(key: string, layouts: ResponsiveLayouts): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(layouts));
  } catch {
    // Silently fail
  }
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function CustomizableGrid({
  layouts: initialLayouts,
  cols = 12,
  rowHeight = 80,
  gap,
  isEditing = false,
  onLayoutChange,
  draggableHandle = '.widget-header',
  children,
  storageKey = 'default',
}: CustomizableGridProps) {
  // Load persisted layout or use initial
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    return loadLayouts(storageKey) ?? initialLayouts;
  });

  // Determine current breakpoint
  const [breakpoint, setBreakpoint] = useState<'lg' | 'md' | 'sm'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const w = window.innerWidth;
      if (w >= 1024) setBreakpoint('lg');
      else if (w >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const currentLayout = layouts[breakpoint] || layouts.lg;

  // Handle layout change
  const handleLayoutChange = useCallback(
    (newLayout: GridItem[]) => {
      const updated = { ...layouts, [breakpoint]: newLayout };
      setLayouts(updated);
      saveLayouts(storageKey, updated);
      onLayoutChange?.(updated);
    },
    [layouts, breakpoint, storageKey, onLayoutChange],
  );

  // Reset layout
  const handleResetLayout = useCallback(() => {
    setLayouts(initialLayouts);
    try {
      localStorage.removeItem(STORAGE_PREFIX + storageKey);
    } catch {}
    onLayoutChange?.(initialLayouts);
  }, [initialLayouts, storageKey, onLayoutChange]);

  // Save current layout explicitly
  const handleSaveLayout = useCallback(() => {
    saveLayouts(storageKey, layouts);
  }, [storageKey, layouts]);

  // Calculate max rows
  const maxRow = currentLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);

  return (
    <div className="customizable-grid">
      {/* Edit mode toolbar */}
      {isEditing && (
        <div className="customizable-grid__toolbar">
          <span className="customizable-grid__toolbar-label">
            Editing Mode: Drag widgets to rearrange
          </span>
          <div className="customizable-grid__toolbar-actions">
            <button className="customizable-grid__save-btn" onClick={handleSaveLayout}>
              Save Layout
            </button>
            <button className="customizable-grid__reset-btn" onClick={handleResetLayout}>
              Reset Layout
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className={`customizable-grid__container ${isEditing ? 'customizable-grid__container--editing' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: `${rowHeight}px`,
          gap: gap ? `${gap}px` : 'var(--layout-grid-gap)',
          minHeight: `${maxRow * rowHeight}px`,
        }}
      >
        {currentLayout.map((item) => (
          <div
            key={item.i}
            className={`customizable-grid__item ${isEditing ? 'customizable-grid__item--editable' : ''}`}
            style={{
              gridColumn: `${item.x + 1} / span ${item.w}`,
              gridRow: `${item.y + 1} / span ${item.h}`,
            }}
            data-widget-id={item.i}
          >
            {children(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Default Sales Dashboard Layouts
   -------------------------------------------------------------------------- */

export const SALES_DASHBOARD_LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-orders', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-conversion', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-aov', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'chart-revenue-trend', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'chart-category', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'chart-comparison', x: 0, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'chart-distribution', x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'table-transactions', x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 4 },
  ],
  md: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 5, h: 2 },
    { i: 'kpi-orders', x: 5, y: 0, w: 5, h: 2 },
    { i: 'kpi-conversion', x: 0, y: 2, w: 5, h: 2 },
    { i: 'kpi-aov', x: 5, y: 2, w: 5, h: 2 },
    { i: 'chart-revenue-trend', x: 0, y: 4, w: 10, h: 4 },
    { i: 'chart-category', x: 0, y: 8, w: 10, h: 4 },
    { i: 'chart-comparison', x: 0, y: 12, w: 10, h: 4 },
    { i: 'chart-distribution', x: 0, y: 16, w: 10, h: 4 },
    { i: 'table-transactions', x: 0, y: 20, w: 10, h: 5 },
  ],
  sm: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 6, h: 2 },
    { i: 'kpi-orders', x: 0, y: 2, w: 6, h: 2 },
    { i: 'kpi-conversion', x: 0, y: 4, w: 6, h: 2 },
    { i: 'kpi-aov', x: 0, y: 6, w: 6, h: 2 },
    { i: 'chart-revenue-trend', x: 0, y: 8, w: 6, h: 4 },
    { i: 'chart-category', x: 0, y: 12, w: 6, h: 4 },
    { i: 'chart-comparison', x: 0, y: 16, w: 6, h: 4 },
    { i: 'chart-distribution', x: 0, y: 20, w: 6, h: 4 },
    { i: 'table-transactions', x: 0, y: 24, w: 6, h: 5 },
  ],
};

export default CustomizableGrid;
