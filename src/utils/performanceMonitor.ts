/* ==========================================================================
   Dashboard Performance Monitor
   Track widget render times, data fetch latency, and report metrics.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface RenderMetric {
  widgetId: string;
  renderTime: number;
  timestamp: number;
}

interface FetchMetric {
  widgetId: string;
  endpoint: string;
  duration: number;
  status: 'success' | 'error';
  cached: boolean;
  timestamp: number;
}

interface PerformanceReport {
  avgRenderTime: number;
  avgFetchTime: number;
  p95RenderTime: number;
  p95FetchTime: number;
  totalRenders: number;
  totalFetches: number;
  cacheHitRate: number;
  errorRate: number;
  slowWidgets: { widgetId: string; avgTime: number }[];
}

/* --------------------------------------------------------------------------
   Performance Monitor Class
   -------------------------------------------------------------------------- */

class PerformanceMonitor {
  private renderMetrics: RenderMetric[] = [];
  private fetchMetrics: FetchMetric[] = [];
  private maxEntries = 1000;

  /**
   * Measure the render time of a widget.
   * Call start before render, end after.
   */
  measureRenderTime(widgetId: string): () => void {
    const start = performance.now();

    return () => {
      const renderTime = performance.now() - start;
      this.renderMetrics.push({
        widgetId,
        renderTime,
        timestamp: Date.now(),
      });
      this.trimMetrics();
    };
  }

  /**
   * Track a data fetch operation.
   */
  trackDataFetch(
    widgetId: string,
    endpoint: string,
    fetchPromise: Promise<any>,
    cached = false,
  ): Promise<any> {
    const start = performance.now();

    return fetchPromise
      .then((result) => {
        this.fetchMetrics.push({
          widgetId,
          endpoint,
          duration: performance.now() - start,
          status: 'success',
          cached,
          timestamp: Date.now(),
        });
        this.trimMetrics();
        return result;
      })
      .catch((error) => {
        this.fetchMetrics.push({
          widgetId,
          endpoint,
          duration: performance.now() - start,
          status: 'error',
          cached: false,
          timestamp: Date.now(),
        });
        this.trimMetrics();
        throw error;
      });
  }

  /**
   * Generate a performance report.
   * Optionally filter by a time window (ms from now).
   */
  reportMetrics(windowMs = 300_000): PerformanceReport {
    const cutoff = Date.now() - windowMs;
    const recentRenders = this.renderMetrics.filter((m) => m.timestamp >= cutoff);
    const recentFetches = this.fetchMetrics.filter((m) => m.timestamp >= cutoff);

    const renderTimes = recentRenders.map((m) => m.renderTime).sort((a, b) => a - b);
    const fetchTimes = recentFetches.map((m) => m.duration).sort((a, b) => a - b);

    const avgRenderTime = average(renderTimes);
    const avgFetchTime = average(fetchTimes);
    const p95RenderTime = percentile(renderTimes, 95);
    const p95FetchTime = percentile(fetchTimes, 95);

    const cacheHits = recentFetches.filter((m) => m.cached).length;
    const errors = recentFetches.filter((m) => m.status === 'error').length;

    // Find slowest widgets
    const widgetRenderMap = new Map<string, number[]>();
    recentRenders.forEach((m) => {
      const arr = widgetRenderMap.get(m.widgetId) || [];
      arr.push(m.renderTime);
      widgetRenderMap.set(m.widgetId, arr);
    });

    const slowWidgets = Array.from(widgetRenderMap.entries())
      .map(([widgetId, times]) => ({
        widgetId,
        avgTime: average(times),
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      avgRenderTime,
      avgFetchTime,
      p95RenderTime,
      p95FetchTime,
      totalRenders: recentRenders.length,
      totalFetches: recentFetches.length,
      cacheHitRate: recentFetches.length > 0 ? cacheHits / recentFetches.length : 0,
      errorRate: recentFetches.length > 0 ? errors / recentFetches.length : 0,
      slowWidgets,
    };
  }

  /**
   * Clear all stored metrics.
   */
  clear(): void {
    this.renderMetrics = [];
    this.fetchMetrics = [];
  }

  /**
   * Log a formatted report to the console.
   */
  logReport(windowMs?: number): void {
    const report = this.reportMetrics(windowMs);
    console.group('Dashboard Performance Report');
    console.table({
      'Avg Render (ms)': report.avgRenderTime.toFixed(2),
      'P95 Render (ms)': report.p95RenderTime.toFixed(2),
      'Avg Fetch (ms)': report.avgFetchTime.toFixed(2),
      'P95 Fetch (ms)': report.p95FetchTime.toFixed(2),
      'Cache Hit Rate': `${(report.cacheHitRate * 100).toFixed(1)}%`,
      'Error Rate': `${(report.errorRate * 100).toFixed(1)}%`,
      'Total Renders': report.totalRenders,
      'Total Fetches': report.totalFetches,
    });

    if (report.slowWidgets.length > 0) {
      console.log('Slowest Widgets:');
      console.table(report.slowWidgets);
    }
    console.groupEnd();
  }

  private trimMetrics(): void {
    if (this.renderMetrics.length > this.maxEntries) {
      this.renderMetrics = this.renderMetrics.slice(-this.maxEntries);
    }
    if (this.fetchMetrics.length > this.maxEntries) {
      this.fetchMetrics = this.fetchMetrics.slice(-this.maxEntries);
    }
  }
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function percentile(sortedValues: number[], pct: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.ceil((pct / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, idx)];
}

/* --------------------------------------------------------------------------
   Singleton Export
   -------------------------------------------------------------------------- */

export const performanceMonitor = new PerformanceMonitor();

export { PerformanceMonitor, type PerformanceReport, type RenderMetric, type FetchMetric };
