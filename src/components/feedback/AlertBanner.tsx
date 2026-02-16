import React, { type ReactNode } from 'react';
import type { AlertBannerProps, AlertVariant } from '../../types/feedback';

/* ==========================================================================
   AlertBanner
   Inline, non-blocking alert banner for persistent status messages.
   Supports success, error, warning, and info variants.
   ========================================================================== */

const ALERT_ICONS: Record<AlertVariant, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 16.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 16.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2.5L1.5 15.5h15L9 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M9 7.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="13.25" r="0.6" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 16.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 8.5v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="6" r="0.6" fill="currentColor" />
    </svg>
  ),
};

export function AlertBanner({
  variant,
  title,
  message,
  dismissible = true,
  onDismiss,
}: AlertBannerProps) {
  return (
    <div
      className={`alert-banner alert-banner--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className="alert-banner__icon">
        {ALERT_ICONS[variant]}
      </div>

      <div className="alert-banner__content">
        {title && <p className="alert-banner__title">{title}</p>}
        <p className="alert-banner__message">{message}</p>
      </div>

      {dismissible && onDismiss && (
        <button
          className="alert-banner__close"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
