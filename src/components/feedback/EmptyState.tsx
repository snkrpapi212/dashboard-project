import React, { type ReactNode } from 'react';
import type { EmptyStateProps, EmptyStateType } from '../../types/feedback';

/* ==========================================================================
   EmptyState
   Illustrated empty state component for no-data, no-results, errors,
   first-use onboarding, and permission-denied scenarios.
   Uses inline SVG illustrations to avoid external dependencies.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Default illustrations per type (inline SVG)
   -------------------------------------------------------------------------- */

const ILLUSTRATIONS: Record<EmptyStateType, ReactNode> = {
  'no-data': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 18h32" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="23" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="13" y="30" width="12" height="4" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="27" y="23" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="27" y="30" width="6" height="4" rx="1" fill="currentColor" opacity="0.2" />
      <circle cx="38" cy="10" r="6" fill="currentColor" opacity="0.15" />
      <path d="M38 7v6M35 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'no-results': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M31 31l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 22h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  error: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.08" />
      <path d="M24 16v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="32" r="1.5" fill="currentColor" />
    </svg>
  ),
  'first-use': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M6 16h36" stroke="currentColor" strokeWidth="2" />
      <path d="M20 28l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 24v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  permission: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="14" y="20" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M18 20v-4a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="30" r="2" fill="currentColor" />
      <path d="M24 32v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function EmptyState({
  type,
  title,
  description,
  illustration,
  actions,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__illustration">
        {illustration || ILLUSTRATIONS[type]}
      </div>

      <h3 className="empty-state__title">{title}</h3>

      {description && (
        <p className="empty-state__description">{description}</p>
      )}

      {actions && actions.length > 0 && (
        <div className="empty-state__actions">
          {actions.map((action, idx) => (
            <button
              key={idx}
              className={
                action.variant === 'secondary'
                  ? 'empty-state__secondary-btn'
                  : 'empty-state__primary-btn'
              }
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
