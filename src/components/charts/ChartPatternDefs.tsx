/**
 * ChartPatternDefs
 *
 * SVG pattern definitions for colorblind-safe chart rendering.
 * Provides distinguishable visual patterns as a secondary channel
 * beyond color, ensuring charts remain readable for users with
 * color vision deficiency.
 *
 * Usage: Include <ChartPatternDefs /> inside an SVG <defs> block,
 * then reference patterns via `url(#pattern-{index})` as fill.
 */

import React from 'react';

export interface ChartPatternDefsProps {
  /** Colors to use for pattern fills */
  colors: string[];
  /** Number of patterns to generate */
  count?: number;
}

export function ChartPatternDefs({ colors, count = 8 }: ChartPatternDefsProps) {
  const patterns = [];

  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    const patternId = `chart-pattern-${i}`;

    switch (i % 5) {
      case 0:
        // Solid fill (no pattern needed, but define for consistency)
        patterns.push(
          <pattern key={patternId} id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={color} />
          </pattern>,
        );
        break;
      case 1:
        // Diagonal lines
        patterns.push(
          <pattern key={patternId} id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill={color} opacity="0.3" />
            <line x1="0" y1="0" x2="0" y2="8" stroke={color} strokeWidth="3" />
          </pattern>,
        );
        break;
      case 2:
        // Dots
        patterns.push(
          <pattern key={patternId} id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill={color} opacity="0.25" />
            <circle cx="4" cy="4" r="2" fill={color} />
          </pattern>,
        );
        break;
      case 3:
        // Cross-hatch
        patterns.push(
          <pattern key={patternId} id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill={color} opacity="0.2" />
            <line x1="0" y1="0" x2="8" y2="8" stroke={color} strokeWidth="1.5" />
            <line x1="8" y1="0" x2="0" y2="8" stroke={color} strokeWidth="1.5" />
          </pattern>,
        );
        break;
      case 4:
        // Horizontal lines
        patterns.push(
          <pattern key={patternId} id={patternId} width="8" height="6" patternUnits="userSpaceOnUse">
            <rect width="8" height="6" fill={color} opacity="0.25" />
            <line x1="0" y1="3" x2="8" y2="3" stroke={color} strokeWidth="2" />
          </pattern>,
        );
        break;
    }
  }

  return <>{patterns}</>;
}

export default ChartPatternDefs;
