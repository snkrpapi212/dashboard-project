import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { ConfirmDialogConfig, DialogVariant } from '../../types/feedback';

/* ==========================================================================
   ConfirmDialog
   Modal confirmation dialog with focus trapping, keyboard navigation,
   and accessible ARIA patterns. Used for destructive action confirmations.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Variant icons
   -------------------------------------------------------------------------- */

const DIALOG_ICONS: Record<DialogVariant, React.ReactNode> = {
  danger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L1.5 21h21L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.75" fill="currentColor" />
    </svg>
  ),
};

export interface ConfirmDialogProps extends ConfirmDialogConfig {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Close the dialog */
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save previous focus on open
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsExiting(false);
    }
  }, [isOpen]);

  // Focus the dialog when opened
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstButton = dialogRef.current.querySelector<HTMLButtonElement>(
        '.dialog__btn--cancel',
      );
      firstButton?.focus();
    }
  }, [isOpen]);

  // Restore focus on close
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
      previousFocusRef.current?.focus();
    }, 150);
  }, [onClose]);

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      handleClose();
    } catch {
      // Keep dialog open on error
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirm, handleClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel?.();
    handleClose();
  }, [onCancel, handleClose]);

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      // Trap focus within dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [handleCancel],
  );

  if (!isOpen) return null;

  return (
    <div
      className={`dialog-overlay${isExiting ? ' dialog-overlay--exiting' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`dialog${isExiting ? ' dialog--exiting' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className={`dialog__icon dialog__icon--${variant}`}>
          {DIALOG_ICONS[variant]}
        </div>

        <h2 id="dialog-title" className="dialog__title">
          {title}
        </h2>

        <p id="dialog-description" className="dialog__description">
          {description}
        </p>

        <div className="dialog__actions">
          <button
            className="dialog__btn dialog__btn--cancel"
            onClick={handleCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            className={`dialog__btn ${variant === 'danger' ? 'dialog__btn--danger' : 'dialog__btn--confirm'}`}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
