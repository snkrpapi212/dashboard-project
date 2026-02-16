import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  ToastConfig,
  ToastState,
  ToastVariant,
} from '../../types/feedback';

/* ==========================================================================
   Toast Context & Provider
   Manages a stack of toast notifications with auto-dismiss, ARIA live
   regions, and configurable positioning (top-right default).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Icons (inline SVG for zero-dependency)
   -------------------------------------------------------------------------- */

const ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" fill="currentColor" opacity="0.15" />
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6.5 10l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" fill="currentColor" opacity="0.15" />
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3L1.5 17h17L10 3z" fill="currentColor" opacity="0.15" />
      <path d="M10 3L1.5 17h17L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" fill="currentColor" opacity="0.15" />
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  ),
};

/* --------------------------------------------------------------------------
   Default durations per variant (ms)
   -------------------------------------------------------------------------- */

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 10000,
};

const MAX_TOASTS = 5;

/* --------------------------------------------------------------------------
   Context API
   -------------------------------------------------------------------------- */

export interface ToastContextType {
  /** Add a toast notification */
  addToast: (config: ToastConfig) => string;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Remove all toasts */
  clearAll: () => void;
  /** Shorthand: success toast */
  success: (title: string, message?: string) => string;
  /** Shorthand: error toast */
  error: (title: string, message?: string) => string;
  /** Shorthand: warning toast */
  warning: (title: string, message?: string) => string;
  /** Shorthand: info toast */
  info: (title: string, message?: string) => string;
  /** Promise-based toast: shows loading, then success/error */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | null>(null);

/* --------------------------------------------------------------------------
   Provider Component
   -------------------------------------------------------------------------- */

let toastCounter = 0;
function generateId(): string {
  return `toast-${++toastCounter}-${Date.now()}`;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    );

    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);

    // Clear any existing timer
    const existing = timers.current.get(id);
    if (existing) {
      clearTimeout(existing);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (config: ToastConfig): string => {
      const id = config.id || generateId();
      const duration = config.duration ?? DEFAULT_DURATIONS[config.variant];
      const dismissible = config.dismissible ?? true;

      const toast: ToastState = {
        id,
        variant: config.variant,
        title: config.title,
        message: config.message,
        duration,
        actions: config.actions,
        dismissible,
        showProgress: config.showProgress ?? (duration > 0),
        isExiting: false,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const next = [toast, ...prev];
        // Enforce max stack limit
        if (next.length > MAX_TOASTS) {
          const removed = next.pop();
          if (removed) {
            const t = timers.current.get(removed.id);
            if (t) {
              clearTimeout(t);
              timers.current.delete(removed.id);
            }
          }
        }
        return next;
      });

      // Auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
          timers.current.delete(id);
        }, duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [removeToast],
  );

  const clearAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      addToast({ variant: 'success', title, message }),
    [addToast],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addToast({ variant: 'error', title, message }),
    [addToast],
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addToast({ variant: 'warning', title, message }),
    [addToast],
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addToast({ variant: 'info', title, message }),
    [addToast],
  );

  const promiseToast = useCallback(
    async <T,>(
      promise: Promise<T>,
      messages: { loading: string; success: string; error: string },
    ): Promise<T> => {
      const id = addToast({
        variant: 'info',
        title: messages.loading,
        duration: 0,
        dismissible: false,
        showProgress: false,
      });

      try {
        const result = await promise;
        // Replace loading toast with success
        removeToast(id);
        addToast({ variant: 'success', title: messages.success });
        return result;
      } catch (err) {
        // Replace loading toast with error
        removeToast(id);
        addToast({
          variant: 'error',
          title: messages.error,
          message: err instanceof Error ? err.message : undefined,
        });
        throw err;
      }
    },
    [addToast, removeToast],
  );

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    promise: promiseToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Toast Container (renders the stack)
   -------------------------------------------------------------------------- */

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastState[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-relevant="additions removals"
      role="status"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Individual Toast Item
   -------------------------------------------------------------------------- */

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: (id: string) => void;
}) {
  const { id, variant, title, message, duration, actions, dismissible, showProgress, isExiting } =
    toast;

  return (
    <div
      className={`toast toast--${variant}${isExiting ? ' toast--exiting' : ''}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`toast__icon toast__icon--${variant}`}>
        {ICONS[variant]}
      </div>

      <div className="toast__content">
        <p className="toast__title">{title}</p>
        {message && <p className="toast__message">{message}</p>}

        {actions && actions.length > 0 && (
          <div className="toast__actions">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`toast__action-btn toast__action-btn--${action.variant || 'primary'}`}
                onClick={() => {
                  action.onClick();
                  onDismiss(id);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          className="toast__close"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      )}

      {showProgress && duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-fill"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Hook
   -------------------------------------------------------------------------- */

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
