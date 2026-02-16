import React, { useState, useCallback } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { DatePreset, FilterPreset } from '../../types/dashboard';

/* ==========================================================================
   AdvancedFilterPanel
   Full-featured filter panel with DateRangePicker, MultiSelect category
   filter, SearchInput, and FilterPresets. Coordinates all widgets through
   the DashboardContext.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Preset configuration
   -------------------------------------------------------------------------- */

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const CATEGORY_OPTIONS = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Home & Garden', value: 'home' },
  { label: 'Sports', value: 'sports' },
  { label: 'Books', value: 'books' },
];

const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'last-week',
    name: 'Last Week',
    filters: { dateRange: { start: new Date(Date.now() - 7 * 86400000), end: new Date(), preset: '7d' } },
  },
  {
    id: 'this-month',
    name: 'This Month',
    filters: { dateRange: { start: new Date(Date.now() - 30 * 86400000), end: new Date(), preset: '30d' } },
    isDefault: true,
  },
  {
    id: 'this-quarter',
    name: 'This Quarter',
    filters: { dateRange: { start: new Date(Date.now() - 90 * 86400000), end: new Date(), preset: '90d' } },
  },
];

/* --------------------------------------------------------------------------
   Component Props
   -------------------------------------------------------------------------- */

export interface AdvancedFilterPanelProps {
  /** Override category options */
  categories?: { label: string; value: string }[];
  /** Override filter presets */
  presets?: FilterPreset[];
  /** Called when the user clicks "Apply" */
  onApply?: () => void;
}

/* --------------------------------------------------------------------------
   AdvancedFilterPanel
   -------------------------------------------------------------------------- */

export function AdvancedFilterPanel({
  categories = CATEGORY_OPTIONS,
  presets = DEFAULT_FILTER_PRESETS,
  onApply,
}: AdvancedFilterPanelProps) {
  const {
    filters,
    setDatePreset,
    setDateRange,
    setCategories,
    toggleCategory,
    setSearch,
    resetFilters,
    activeFilterCount,
    triggerRefresh,
  } = useDashboard();

  const [showCustomDates, setShowCustomDates] = useState(
    filters.dateRange.preset === 'custom',
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  /* -- Date preset handler -- */
  const handleDatePreset = useCallback(
    (preset: DatePreset) => {
      if (preset === 'custom') {
        setShowCustomDates(true);
      } else {
        setShowCustomDates(false);
        setDatePreset(preset);
      }
    },
    [setDatePreset],
  );

  /* -- Custom date handler -- */
  const handleCustomDate = useCallback(
    (field: 'start' | 'end', value: string) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) return;
      setDateRange({
        ...filters.dateRange,
        [field]: date,
        preset: 'custom',
      });
    },
    [filters.dateRange, setDateRange],
  );

  /* -- Filter presets -- */
  const handleLoadPreset = useCallback(
    (preset: FilterPreset) => {
      if (preset.filters.dateRange) {
        setDateRange(preset.filters.dateRange);
      }
      if (preset.filters.categories) {
        setCategories(preset.filters.categories);
      }
      setShowPresets(false);
    },
    [setDateRange, setCategories],
  );

  /* -- Apply -- */
  const handleApply = useCallback(() => {
    triggerRefresh();
    onApply?.();
  }, [triggerRefresh, onApply]);

  return (
    <div className="filter-panel" role="search" aria-label="Dashboard filters">
      {/* Search input */}
      <div className="filter-panel__group">
        <label className="filter-panel__label" htmlFor="filter-search">
          Search
        </label>
        <div className="filter-panel__search-wrapper">
          <SearchIcon />
          <input
            id="filter-search"
            type="search"
            className="filter-panel__search-input"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Date range */}
      <div className="filter-panel__group">
        <label className="filter-panel__label">Date Range</label>
        <div className="filter-panel__date-presets" role="radiogroup" aria-label="Date range presets">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              className={`filter-panel__preset-btn ${filters.dateRange.preset === p.value ? 'filter-panel__preset-btn--active' : ''}`}
              onClick={() => handleDatePreset(p.value)}
              role="radio"
              aria-checked={filters.dateRange.preset === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>

        {showCustomDates && (
          <div className="filter-panel__custom-dates">
            <input
              type="date"
              className="filter-panel__date-input"
              value={toISODate(filters.dateRange.start)}
              onChange={(e) => handleCustomDate('start', e.target.value)}
              aria-label="Start date"
            />
            <span className="filter-panel__date-separator">to</span>
            <input
              type="date"
              className="filter-panel__date-input"
              value={toISODate(filters.dateRange.end)}
              onChange={(e) => handleCustomDate('end', e.target.value)}
              aria-label="End date"
            />
          </div>
        )}
      </div>

      {/* Category multi-select */}
      <div className="filter-panel__group">
        <label className="filter-panel__label">Category</label>
        <div className="filter-panel__multiselect">
          <button
            className="filter-panel__multiselect-trigger"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            aria-haspopup="listbox"
            aria-expanded={showCategoryDropdown}
          >
            {filters.categories.length === 0
              ? 'All Categories'
              : `${filters.categories.length} selected`}
            <span className="filter-panel__chevron" aria-hidden="true">
              {showCategoryDropdown ? '\u25B2' : '\u25BC'}
            </span>
          </button>

          {showCategoryDropdown && (
            <div className="filter-panel__dropdown" role="listbox" aria-multiselectable="true">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className="filter-panel__dropdown-item"
                  role="option"
                  aria-selected={filters.categories.includes(cat.value)}
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.value)}
                    onChange={() => toggleCategory(cat.value)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Active category chips */}
        {filters.categories.length > 0 && (
          <div className="filter-panel__chips">
            {filters.categories.map((cat) => {
              const option = categories.find((c) => c.value === cat);
              return (
                <span key={cat} className="filter-panel__chip">
                  {option?.label ?? cat}
                  <button
                    className="filter-panel__chip-remove"
                    onClick={() => toggleCategory(cat)}
                    aria-label={`Remove ${option?.label ?? cat} filter`}
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Presets */}
      <div className="filter-panel__group filter-panel__group--presets">
        <button
          className="filter-panel__presets-btn"
          onClick={() => setShowPresets(!showPresets)}
          aria-haspopup="menu"
          aria-expanded={showPresets}
        >
          FilterPresets ({presets.length})
        </button>
        {showPresets && (
          <div className="filter-panel__presets-menu" role="menu">
            {presets.map((p) => (
              <button
                key={p.id}
                role="menuitem"
                className="filter-panel__preset-item"
                onClick={() => handleLoadPreset(p)}
              >
                {p.name}
                {p.isDefault && <span className="filter-panel__default-badge">Default</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="filter-panel__actions">
        <button
          className="filter-panel__apply-btn"
          onClick={handleApply}
        >
          Apply Filters
        </button>
        <button
          className="filter-panel__reset-btn"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
        >
          Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Utilities
   -------------------------------------------------------------------------- */

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function SearchIcon() {
  return (
    <svg
      className="filter-panel__search-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AdvancedFilterPanel;
