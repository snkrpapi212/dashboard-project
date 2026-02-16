import React from 'react';
import type { ProgressBarProps } from '../../types/feedback';

/* ==========================================================================
   ProgressBar
   Linear progress indicator with determinate and indeterminate modes.
   Supports labels, percentage display, and variant colors.
   All styling uses design tokens via CSS classes.
   ========================================================================== */

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  label,
  showValue = false,
  description,
  ariaLabel,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPercentage = Math.round(percentage);

  const hasHeader = label || showValue;
  const hasWrapper = hasHeader || description;

  const bar = (
    <div
      className={`progress-bar progress-bar--${size}${indeterminate ? ' progress-bar--indeterminate' : ''}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : roundedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || label || 'Progress'}
    >
      <div
        className={`progress-bar__fill progress-bar__fill--${variant}`}
        style={indeterminate ? undefined : { width: `${percentage}%` }}
      />
    </div>
  );

  if (!hasWrapper) return bar;

  return (
    <div className="progress-bar-wrapper">
      {hasHeader && (
        <div className="progress-bar-wrapper__header">
          {label && <span className="progress-bar-wrapper__label">{label}</span>}
          {showValue && !indeterminate && (
            <span className="progress-bar-wrapper__value">{roundedPercentage}%</span>
          )}
        </div>
      )}
      {bar}
      {description && (
        <span className="progress-bar-wrapper__description">{description}</span>
      )}
    </div>
  );
}

export default ProgressBar;
