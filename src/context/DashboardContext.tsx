import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  DashboardFilters,
  DateRange,
  DatePreset,
  WidgetConfig,
} from '../types/dashboard';

/* --------------------------------------------------------------------------
   Default Filter Values
   -------------------------------------------------------------------------- */

function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end, preset: '30d' };
}

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: getDefaultDateRange(),
  categories: [],
  regions: [],
  search: '',
  comparison: { enabled: false, period: 'previous' },
  granularity: 'day',
};

/* --------------------------------------------------------------------------
   Actions
   -------------------------------------------------------------------------- */

type FilterAction =
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_DATE_PRESET'; payload: DatePreset }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'SET_REGIONS'; payload: string[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_COMPARISON'; payload: { enabled: boolean; period: 'previous' | 'year-ago' } }
  | { type: 'SET_GRANULARITY'; payload: 'hour' | 'day' | 'week' | 'month' }
  | { type: 'RESET_FILTERS' };

/* --------------------------------------------------------------------------
   Reducer
   -------------------------------------------------------------------------- */

function calculateDateRange(preset: DatePreset): DateRange {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end, preset };
}

function filterReducer(
  state: DashboardFilters,
  action: FilterAction,
): DashboardFilters {
  switch (action.type) {
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_DATE_PRESET':
      return { ...state, dateRange: calculateDateRange(action.payload) };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'TOGGLE_CATEGORY': {
      const cat = action.payload;
      const categories = state.categories.includes(cat)
        ? state.categories.filter((c) => c !== cat)
        : [...state.categories, cat];
      return { ...state, categories };
    }
    case 'SET_REGIONS':
      return { ...state, regions: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload };
    case 'SET_GRANULARITY':
      return { ...state, granularity: action.payload };
    case 'RESET_FILTERS':
      return { ...DEFAULT_FILTERS, dateRange: getDefaultDateRange() };
    default:
      return state;
  }
}

/* --------------------------------------------------------------------------
   Context Shape
   -------------------------------------------------------------------------- */

export interface DashboardContextType {
  /** Current filter state */
  filters: DashboardFilters;
  /** Dispatch filter actions */
  dispatch: React.Dispatch<FilterAction>;
  /** Convenience: set the date range */
  setDateRange: (range: DateRange) => void;
  /** Convenience: apply a date preset */
  setDatePreset: (preset: DatePreset) => void;
  /** Convenience: set categories */
  setCategories: (categories: string[]) => void;
  /** Convenience: toggle a single category */
  toggleCategory: (category: string) => void;
  /** Convenience: set search */
  setSearch: (search: string) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Number of currently active filters */
  activeFilterCount: number;
  /** Auto-refresh toggle */
  autoRefresh: boolean;
  /** Set auto-refresh */
  setAutoRefresh: (enabled: boolean) => void;
  /** Refresh interval in ms */
  refreshInterval: number;
  /** Set refresh interval */
  setRefreshInterval: (ms: number) => void;
  /** Last full data refresh timestamp */
  lastRefreshed: number;
  /** Trigger a manual refresh */
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

/* --------------------------------------------------------------------------
   Provider
   -------------------------------------------------------------------------- */

export interface DashboardProviderProps {
  children: ReactNode;
  /** Override default filters */
  defaultFilters?: Partial<DashboardFilters>;
  /** Initial auto-refresh state */
  defaultAutoRefresh?: boolean;
  /** Default refresh interval in ms */
  defaultRefreshInterval?: number;
}

export function DashboardProvider({
  children,
  defaultFilters,
  defaultAutoRefresh = true,
  defaultRefreshInterval = 30_000,
}: DashboardProviderProps) {
  const initialFilters: DashboardFilters = {
    ...DEFAULT_FILTERS,
    ...defaultFilters,
    dateRange: defaultFilters?.dateRange ?? getDefaultDateRange(),
  };

  const [filters, dispatch] = useReducer(filterReducer, initialFilters);
  const [autoRefresh, setAutoRefresh] = useState(defaultAutoRefresh);
  const [refreshInterval, setRefreshInterval] = useState(defaultRefreshInterval);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.preset !== '30d') count++;
    count += filters.categories.length;
    count += filters.regions.length;
    if (filters.search) count++;
    if (filters.comparison.enabled) count++;
    if (filters.granularity !== 'day') count++;
    return count;
  }, [filters]);

  // Convenience dispatchers
  const setDateRange = useCallback(
    (range: DateRange) => dispatch({ type: 'SET_DATE_RANGE', payload: range }),
    [],
  );
  const setDatePreset = useCallback(
    (preset: DatePreset) => dispatch({ type: 'SET_DATE_PRESET', payload: preset }),
    [],
  );
  const setCategories = useCallback(
    (categories: string[]) => dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    [],
  );
  const toggleCategory = useCallback(
    (category: string) => dispatch({ type: 'TOGGLE_CATEGORY', payload: category }),
    [],
  );
  const setSearch = useCallback(
    (search: string) => dispatch({ type: 'SET_SEARCH', payload: search }),
    [],
  );
  const resetFilters = useCallback(
    () => dispatch({ type: 'RESET_FILTERS' }),
    [],
  );
  const triggerRefresh = useCallback(() => {
    setLastRefreshed(Date.now());
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    try {
      const serializable = {
        ...filters,
        dateRange: {
          start: filters.dateRange.start.toISOString(),
          end: filters.dateRange.end.toISOString(),
          preset: filters.dateRange.preset,
        },
      };
      localStorage.setItem('dashboard-filters', JSON.stringify(serializable));
    } catch {
      // Silently fail if localStorage unavailable
    }
  }, [filters]);

  const value: DashboardContextType = {
    filters,
    dispatch,
    setDateRange,
    setDatePreset,
    setCategories,
    toggleCategory,
    setSearch,
    resetFilters,
    activeFilterCount,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    lastRefreshed,
    triggerRefresh,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Hook
   -------------------------------------------------------------------------- */

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
