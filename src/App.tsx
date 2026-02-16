import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardSkeleton } from './components/feedback';

/* ==========================================================================
   App Component
   Root component that loads the Sales Dashboard page with error boundary
   and suspense loading state for code-split chunks.
   ========================================================================== */

// Lazy-load the dashboard page for code splitting
const SalesDashboardPage = lazy(() =>
  import('./pages/Dashboard').then((module) => ({
    default: module.SalesDashboardPage,
  })),
);

function App() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--spacing-xl, 2rem)',
            textAlign: 'center',
            background: 'var(--color-bg-page, #f8fafc)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-2xl, 1.5rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              color: 'var(--color-text-primary, #1e293b)',
              marginBottom: 'var(--spacing-md, 1rem)',
            }}
          >
            Application Error
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-base, 1rem)',
              color: 'var(--color-text-secondary, #64748b)',
              marginBottom: 'var(--spacing-lg, 1.5rem)',
              maxWidth: '600px',
            }}
          >
            {error.message || 'The application encountered an unexpected error.'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: 'var(--spacing-sm, 0.5rem) var(--spacing-lg, 1.5rem)',
              fontSize: 'var(--font-size-base, 1rem)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-white, #fff)',
              backgroundColor: 'var(--color-primary, #3b82f6)',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
            }}
          >
            Reload Dashboard
          </button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // In production, send to error tracking service
        console.error('[App] Unhandled error:', error);
        console.error('[App] Component stack:', errorInfo.componentStack);
      }}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <SalesDashboardPage />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
