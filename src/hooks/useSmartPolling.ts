import { useState, useEffect, useRef, useCallback } from 'react';

/* ==========================================================================
   useSmartPolling
   Periodic data fetching with tab visibility detection, exponential backoff
   on errors, and manual pause/resume control.
   ========================================================================== */

export interface SmartPollingOptions {
  /** Polling interval in milliseconds (default: 30000) */
  interval?: number;
  /** Whether polling is initially enabled (default: true) */
  enabled?: boolean;
  /** Pause polling when the browser tab is hidden (default: true) */
  pauseOnHidden?: boolean;
  /** Maximum back-off interval on consecutive errors (default: 60000) */
  maxBackoff?: number;
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean;
}

export interface SmartPollingResult<T> {
  data: T | null;
  error: Error | null;
  isPolling: boolean;
  lastFetched: number | null;
  /** Resume polling */
  start: () => void;
  /** Pause polling */
  pause: () => void;
  /** Trigger an immediate fetch regardless of timer */
  refetch: () => void;
}

export function useSmartPolling<T>(
  fetchFn: () => Promise<T>,
  options: SmartPollingOptions = {},
): SmartPollingResult<T> {
  const {
    interval = 30_000,
    enabled = true,
    pauseOnHidden = true,
    maxBackoff = 60_000,
    immediate = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const errorCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Core fetch logic
  const doFetch = useCallback(async () => {
    try {
      const result = await fetchFnRef.current();
      setData(result);
      setError(null);
      setLastFetched(Date.now());
      errorCountRef.current = 0;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      errorCountRef.current++;
    }
  }, []);

  // Start / stop polling
  useEffect(() => {
    if (!isPolling) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (immediate) {
      doFetch();
    }

    const currentInterval = Math.min(
      interval * Math.pow(2, errorCountRef.current),
      maxBackoff,
    );

    timerRef.current = setInterval(doFetch, currentInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPolling, interval, maxBackoff, immediate, doFetch]);

  // Pause when tab hidden
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (isPolling) {
        // Tab became visible again -- immediate fetch + restart timer
        doFetch();
        timerRef.current = setInterval(doFetch, interval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseOnHidden, isPolling, interval, doFetch]);

  const start = useCallback(() => setIsPolling(true), []);
  const pause = useCallback(() => setIsPolling(false), []);
  const refetch = useCallback(() => {
    doFetch();
  }, [doFetch]);

  return { data, error, isPolling, lastFetched, start, pause, refetch };
}
