import React, { Component, type ReactNode, type ErrorInfo } from 'react';

/* ==========================================================================
   WidgetContainer
   Common widget wrapper with drag handle, header, error boundary, and
   loading/error states.
   ========================================================================== */

export interface WidgetContainerProps {
  /** Widget title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether the widget is in customization (draggable) mode */
  isDraggable?: boolean;
  /** Header action buttons */
  actions?: ReactNode;
  /** Widget content */
  children: ReactNode;
}

export function WidgetContainer({
  title,
  subtitle,
  isDraggable = false,
  actions,
  children,
}: WidgetContainerProps) {
  return (
    <div className="widget-container">
      <div className={`widget-header ${isDraggable ? 'widget-header--draggable' : ''}`}>
        <div className="widget-header__title-group">
          {isDraggable && (
            <span className="widget-header__drag-handle" aria-hidden="true">
              &#x2630;
            </span>
          )}
          <h3 className="widget-header__title">{title}</h3>
          {subtitle && <p className="widget-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="widget-header__actions">{actions}</div>}
      </div>
      <div className="widget-container__body">
        <WidgetErrorBoundary>
          {children}
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Error Boundary
   Isolates widget errors so one failing widget does not crash the dashboard.
   -------------------------------------------------------------------------- */

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error" role="alert">
          <p className="widget-error__message">Something went wrong in this widget.</p>
          <p className="widget-error__detail">{this.state.error?.message}</p>
          <button
            className="widget-error__retry-btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { WidgetErrorBoundary };
export default WidgetContainer;
