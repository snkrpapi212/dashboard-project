import { useState, useEffect, useRef, useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';

/* ==========================================================================
   useCachedWidget
   Widget-level caching hook with TTL expiration.
   Serves stale data from cache while fetching fresh data in the background.
   ========================================================================== */

export interface CachedWidgetOptions {
  /** Cache time-to-live in ms (default: 60000 = 1 minute) */
  ttl?: number;
  /** Whether the widget should respond to global filter changes (default: true) */
  respondToFilters?: boolean;
  /** Whether to serve stale cache while revalidating (default: true) */
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  filterHash: string;
}

export interface CachedWidgetResult<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;
  lastUpdated: number | null;
  refetch: () => void;
}

/**
 * Create a simple hash of the current filter state for cache invalidation.
 */
function hashFilters(filters: any): string {
  try {
    return JSON.stringify(filters);
  } catch {
    return '';
  }
}

export function useCachedWidget<T>(
  widgetId: string,
  fetcher: () => Promise<T>,
  options: CachedWidgetOptions = {},
): CachedWidgetResult<T> {
  const {
    ttl = 60_000,
    respondToFilters = true,
    staleWhileRevalidate = true,
  } = options;

  const { filters, lastRefreshed } = useDashboard();

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const cacheRef = useRef<CacheEntry<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const currentFilterHash = respondToFilters ? hashFilters(filters) : 'static';

  const doFetch = useCallback(async () => {
    const now = Date.now();
    const cached = cacheRef.current;

    // Check if cache is still valid
    if (
      cached &&
      cached.filterHash === currentFilterHash &&
      now - cached.timestamp < ttl
    ) {
      setData(cached.data);
      setIsLoading(false);
      setIsStale(false);
      return;
    }

    // Serve stale data while revalidating
    if (cached && staleWhileRevalidate && cached.filterHash === currentFilterHash) {
      setData(cached.data);
      setIsStale(true);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const freshData = await fetcherRef.current();
      cacheRef.current = {
        data: freshData,
        timestamp: Date.now(),
        filterHash: currentFilterHash,
      };
      setData(freshData);
      setError(null);
      setIsStale(false);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Keep showing stale data on error if available
      if (!cached) {
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentFilterHash, ttl, staleWhileRevalidate]);

  // Refetch when filters change or manual refresh triggered
  useEffect(() => {
    doFetch();
  }, [doFetch, lastRefreshed]);

  const refetch = useCallback(() => {
    // Invalidate cache and fetch
    cacheRef.current = null;
    doFetch();
  }, [doFetch]);

  return { data, isLoading, isStale, error, lastUpdated, refetch };
}
