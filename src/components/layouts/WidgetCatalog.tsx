import React, { useState, useCallback } from 'react';
import type { WidgetConfig, WidgetType } from '../../types/dashboard';

/* ==========================================================================
   WidgetCatalog
   A panel listing available widgets that users can add to or remove from
   their customizable dashboard grid.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Available Widget Definitions
   -------------------------------------------------------------------------- */

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  /** Default grid dimensions */
  defaultW: number;
  defaultH: number;
  /** Preview icon / label */
  icon: string;
  /** Whether widget can appear multiple times */
  allowMultiple?: boolean;
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: 'kpi-revenue',
    type: 'kpi',
    title: 'Revenue',
    description: 'Total revenue with trend and sparkline',
    defaultW: 3,
    defaultH: 2,
    icon: '$',
  },
  {
    id: 'kpi-orders',
    type: 'kpi',
    title: 'Orders',
    description: 'Total order count with trend',
    defaultW: 3,
    defaultH: 2,
    icon: '#',
  },
  {
    id: 'kpi-conversion',
    type: 'kpi',
    title: 'Conversion Rate',
    description: 'Conversion rate with trend indicator',
    defaultW: 3,
    defaultH: 2,
    icon: '%',
  },
  {
    id: 'kpi-aov',
    type: 'kpi',
    title: 'Average Order Value',
    description: 'AOV with sparkline and comparison',
    defaultW: 3,
    defaultH: 2,
    icon: '\u00F8', // avg symbol
  },
  {
    id: 'chart-revenue-trend',
    type: 'chart',
    title: 'Revenue Trend',
    description: 'Line/area chart of daily revenue over time',
    defaultW: 8,
    defaultH: 4,
    icon: '\u2571',
  },
  {
    id: 'chart-comparison',
    type: 'chart',
    title: 'Product Comparison',
    description: 'Bar chart comparing product performance',
    defaultW: 6,
    defaultH: 4,
    icon: '\u2503',
  },
  {
    id: 'chart-category',
    type: 'chart',
    title: 'Category Breakdown',
    description: 'Pie/donut chart of sales by category',
    defaultW: 4,
    defaultH: 4,
    icon: '\u25CB',
  },
  {
    id: 'chart-distribution',
    type: 'chart',
    title: 'Regional Distribution',
    description: 'Pie chart of sales distribution by region',
    defaultW: 6,
    defaultH: 4,
    icon: '\u25CB',
  },
  {
    id: 'table-transactions',
    type: 'table',
    title: 'Transactions Table',
    description: 'Sortable, filterable data table of recent transactions',
    defaultW: 12,
    defaultH: 5,
    icon: '\u2261',
  },
];

/* --------------------------------------------------------------------------
   Props
   -------------------------------------------------------------------------- */

export interface WidgetCatalogProps {
  /** IDs of widgets currently on the dashboard */
  activeWidgetIds: string[];
  /** Called when user wants to add a widget */
  onAddWidget: (widget: WidgetDefinition) => void;
  /** Called when user wants to remove a widget */
  onRemoveWidget: (widgetId: string) => void;
  /** Whether the catalog panel is open */
  isOpen?: boolean;
  /** Close handler */
  onClose?: () => void;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function WidgetCatalog({
  activeWidgetIds,
  onAddWidget,
  onRemoveWidget,
  isOpen = true,
  onClose,
}: WidgetCatalogProps) {
  const [filterType, setFilterType] = useState<WidgetType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWidgets = AVAILABLE_WIDGETS.filter((w) => {
    if (filterType !== 'all' && w.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const addWidget = useCallback(
    (widget: WidgetDefinition) => {
      onAddWidget(widget);
    },
    [onAddWidget],
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      onRemoveWidget(widgetId);
    },
    [onRemoveWidget],
  );

  if (!isOpen) return null;

  return (
    <aside className="widget-catalog" role="complementary" aria-label="Widget catalog">
      <div className="widget-catalog__header">
        <h3 className="widget-catalog__title">Widget Catalog</h3>
        {onClose && (
          <button
            className="widget-catalog__close-btn"
            onClick={onClose}
            aria-label="Close widget catalog"
          >
            &times;
          </button>
        )}
      </div>

      {/* Search */}
      <div className="widget-catalog__search">
        <input
          type="search"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="widget-catalog__search-input"
          aria-label="Search widgets"
        />
      </div>

      {/* Type filter */}
      <div className="widget-catalog__type-filter" role="tablist" aria-label="Filter by type">
        {(['all', 'kpi', 'chart', 'table'] as const).map((type) => (
          <button
            key={type}
            className={`widget-catalog__type-btn ${filterType === type ? 'widget-catalog__type-btn--active' : ''}`}
            onClick={() => setFilterType(type)}
            role="tab"
            aria-selected={filterType === type}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Widget list */}
      <ul className="widget-catalog__list" role="list">
        {filteredWidgets.map((widget) => {
          const isActive = activeWidgetIds.includes(widget.id);
          return (
            <li key={widget.id} className="widget-catalog__item">
              <div className="widget-catalog__item-icon" aria-hidden="true">
                {widget.icon}
              </div>
              <div className="widget-catalog__item-info">
                <span className="widget-catalog__item-title">{widget.title}</span>
                <span className="widget-catalog__item-description">
                  {widget.description}
                </span>
              </div>
              <button
                className={`widget-catalog__item-action ${isActive ? 'widget-catalog__item-action--remove' : ''}`}
                onClick={() => (isActive ? removeWidget(widget.id) : addWidget(widget))}
                aria-label={isActive ? `Remove ${widget.title}` : `Add ${widget.title}`}
              >
                {isActive ? '\u2212' : '+'}
              </button>
            </li>
          );
        })}
      </ul>

      {filteredWidgets.length === 0 && (
        <p className="widget-catalog__empty">No widgets match your search.</p>
      )}
    </aside>
  );
}

export default WidgetCatalog;
