import React from 'react';
import type { CircularProgressProps } from '../../types/feedback';

/* ==========================================================================
   CircularProgress
   Circular/ring progress indicator for exports and compact progress display.
   Supports determinate (with percentage label) and indeterminate (spinner).
   ========================================================================== */

const SIZE_MAP = {
  sm: 24,
  md: 40,
  lg: 56,
};

export function CircularProgress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  showLabel = false,
  ariaLabel,
}: CircularProgressProps) {
  const pixelSize = SIZE_MAP[size];
  const radius = (pixelSize - 6) / 2; // account for stroke width
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;
  const roundedPercentage = Math.round(percentage);

  const variantClass = variant !== 'default' ? ` progress-circular__fill--${variant}` : '';

  return (
    <div
      className={`progress-circular progress-circular--${size}${indeterminate ? ' progress-circular--indeterminate' : ''}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : roundedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || 'Progress'}
    >
      <svg className="progress-circular__svg" viewBox={`0 0 ${pixelSize} ${pixelSize}`}>
        <circle
          className="progress-circular__track"
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
        />
        <circle
          className={`progress-circular__fill${variantClass}`}
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? undefined : offset}
        />
      </svg>
      {showLabel && !indeterminate && size !== 'sm' && (
        <span className="progress-circular__label">{roundedPercentage}%</span>
      )}
    </div>
  );
}

export default CircularProgress;
