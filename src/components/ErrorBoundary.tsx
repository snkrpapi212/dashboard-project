import React, { Component, type ErrorInfo, type ReactNode } from 'react';

/* ==========================================================================
   Error Boundary
   Catches render errors in child component trees and displays a fallback UI.
   Supports optional onError callback for external error reporting.
   ========================================================================== */

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: 'var(--spacing-xl, 2rem)',
            textAlign: 'center',
            background: 'var(--color-bg-primary, #fff)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--radius-lg, 12px)',
            margin: 'var(--spacing-md, 1rem)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-lg, 1.125rem)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-text-primary, #1e293b)',
              marginBottom: 'var(--spacing-sm, 0.5rem)',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-sm, 0.875rem)',
              color: 'var(--color-text-secondary, #64748b)',
              marginBottom: 'var(--spacing-md, 1rem)',
              maxWidth: '480px',
            }}
          >
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: 'var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem)',
              fontSize: 'var(--font-size-sm, 0.875rem)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-white, #fff)',
              backgroundColor: 'var(--color-primary, #3b82f6)',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
              transition: 'opacity 150ms ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
