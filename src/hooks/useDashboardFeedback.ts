import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/feedback/ToastProvider';
import type { ExportFormat } from '../types/dashboard';

/* ==========================================================================
   useDashboardFeedback
   Integration hook that connects toast notifications and progress tracking
   with dashboard actions: export, refresh, bulk operations, and errors.
   ========================================================================== */

export interface ExportProgress {
  isExporting: boolean;
  progress: number;
  format: ExportFormat | null;
}

export function useDashboardFeedback() {
  const toast = useToast();

  // --- Export Progress ---
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    format: null,
  });

  const exportInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Wrap an export operation with progress simulation and toast feedback.
   */
  const handleExportWithFeedback = useCallback(
    async (
      format: string,
      exportFn: () => Promise<void>,
    ) => {
      setExportProgress({ isExporting: true, progress: 0, format: format as ExportFormat });

      // Simulate progress for better UX
      let progress = 0;
      exportInterval.current = setInterval(() => {
        progress = Math.min(progress + Math.random() * 15, 90);
        setExportProgress((prev) => ({ ...prev, progress }));
      }, 200);

      try {
        await exportFn();

        // Complete progress
        if (exportInterval.current) clearInterval(exportInterval.current);
        setExportProgress({ isExporting: true, progress: 100, format: format as ExportFormat });

        // Short delay to show completion
        setTimeout(() => {
          setExportProgress({ isExporting: false, progress: 0, format: null });
        }, 500);

        toast.success(
          'Export complete',
          `Your ${format.toUpperCase()} file has been downloaded.`,
        );
      } catch (err) {
        if (exportInterval.current) clearInterval(exportInterval.current);
        setExportProgress({ isExporting: false, progress: 0, format: null });

        toast.error(
          'Export failed',
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        );
      }
    },
    [toast],
  );

  // --- Refresh Feedback ---
  const handleRefreshWithFeedback = useCallback(
    (refreshFn: () => void) => {
      refreshFn();
      toast.success('Dashboard refreshed', 'All widgets have been updated with the latest data.');
    },
    [toast],
  );

  // --- Filter Applied Feedback ---
  const handleFilterApplied = useCallback(
    (filterCount: number) => {
      if (filterCount > 0) {
        toast.info(
          'Filters applied',
          `${filterCount} filter${filterCount > 1 ? 's' : ''} active. Showing filtered results.`,
        );
      } else {
        toast.info('Filters cleared', 'Showing all data.');
      }
    },
    [toast],
  );

  // --- Bulk Action Feedback ---
  const handleBulkAction = useCallback(
    (action: string, count: number) => {
      toast.success(
        `${action} complete`,
        `${count} item${count > 1 ? 's' : ''} ${action.toLowerCase()}.`,
      );
    },
    [toast],
  );

  // --- Error Feedback ---
  const handleError = useCallback(
    (title: string, message?: string) => {
      toast.error(title, message);
    },
    [toast],
  );

  // --- Connection Status ---
  const handleConnectionChange = useCallback(
    (isOnline: boolean) => {
      if (isOnline) {
        toast.success('Connection restored', 'Auto-refresh has resumed.');
      } else {
        toast.warning(
          'Connection lost',
          'You are offline. Dashboard data may be stale.',
        );
      }
    },
    [toast],
  );

  // --- Confirmation Helper ---
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info';
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const showConfirmation = useCallback(
    (config: {
      title: string;
      description: string;
      variant?: 'danger' | 'warning' | 'info';
      confirmLabel?: string;
      onConfirm: () => void | Promise<void>;
    }) => {
      setConfirmDialog({
        isOpen: true,
        title: config.title,
        description: config.description,
        variant: config.variant || 'danger',
        confirmLabel: config.confirmLabel || 'Confirm',
        onConfirm: config.onConfirm,
      });
    },
    [],
  );

  const closeConfirmation = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toast,
    exportProgress,
    handleExportWithFeedback,
    handleRefreshWithFeedback,
    handleFilterApplied,
    handleBulkAction,
    handleError,
    handleConnectionChange,
    confirmDialog,
    showConfirmation,
    closeConfirmation,
  };
}

export default useDashboardFeedback;
