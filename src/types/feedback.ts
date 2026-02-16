/* ==========================================================================
   Feedback System Types & Interfaces
   Toast, progress, empty state, confirmation dialog, and alert types.
   ========================================================================== */

import type { ReactNode } from 'react';

/* --------------------------------------------------------------------------
   Toast Types
   -------------------------------------------------------------------------- */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Visual style of the action button */
  variant?: 'primary' | 'secondary';
}

export interface ToastConfig {
  /** Unique identifier (auto-generated if omitted) */
  id?: string;
  /** Visual variant determining icon and color */
  variant: ToastVariant;
  /** Bold title text */
  title: string;
  /** Optional description/message text */
  message?: string;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Optional action buttons */
  actions?: ToastAction[];
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean;
  /** Show countdown progress bar */
  showProgress?: boolean;
  /** Timestamp of creation */
  createdAt?: number;
}

export interface ToastState extends Required<Pick<ToastConfig, 'id' | 'variant' | 'title' | 'dismissible' | 'createdAt'>> {
  message?: string;
  duration: number;
  actions?: ToastAction[];
  showProgress: boolean;
  isExiting: boolean;
}

/* --------------------------------------------------------------------------
   Progress Types
   -------------------------------------------------------------------------- */

export type ProgressVariant = 'default' | 'success' | 'error' | 'warning';

export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Size of the bar */
  size?: ProgressSize;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Optional label displayed above the bar */
  label?: string;
  /** Whether to show percentage text */
  showValue?: boolean;
  /** Description text below the bar */
  description?: string;
  /** Accessible label */
  ariaLabel?: string;
}

export interface CircularProgressProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Size of the circle */
  size?: ProgressSize;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Accessible label */
  ariaLabel?: string;
}

/* --------------------------------------------------------------------------
   Empty State Types
   -------------------------------------------------------------------------- */

export type EmptyStateType = 'no-data' | 'no-results' | 'error' | 'first-use' | 'permission';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  /** Type of empty state determining default illustration */
  type: EmptyStateType;
  /** Headline text */
  title: string;
  /** Descriptive text */
  description?: string;
  /** Custom illustration/icon (overrides type default) */
  illustration?: ReactNode;
  /** Action buttons */
  actions?: EmptyStateAction[];
}

/* --------------------------------------------------------------------------
   Confirmation Dialog Types
   -------------------------------------------------------------------------- */

export type DialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogConfig {
  /** Dialog title */
  title: string;
  /** Description / body text */
  description: string;
  /** Visual variant affecting icon and confirm button style */
  variant?: DialogVariant;
  /** Confirm button label (default: "Confirm") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Called when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Called when cancelled */
  onCancel?: () => void;
}

/* --------------------------------------------------------------------------
   Alert Banner Types
   -------------------------------------------------------------------------- */

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertBannerProps {
  /** Visual variant */
  variant: AlertVariant;
  /** Bold title */
  title?: string;
  /** Message content */
  message: string;
  /** Whether it can be dismissed */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
}
