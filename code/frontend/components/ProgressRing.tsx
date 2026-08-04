'use client';

/**
 * ProgressRing — SVG ring showing the fraction of time remaining.
 *
 * The ring is a full circle (r=118, viewBox 260×260) rotated -90° so
 * the progress stroke starts at the top.
 *
 * At 100% remaining the stroke is full (dashoffset = 0).
 * As time elapses the stroke shortens clockwise.
 *
 * Colour follows the session type via CSS class on the wrapper:
 *   Work       → tomato  (#E4572E)   default
 *   Short Break → green  (#2F9E77)  wrapper gets className `isGreen`
 *   Long Break  → blue   (#3B6FE0)  wrapper gets className `isBlue`
 *
 * The ring is static in this story (AC-2: nothing ticks yet).
 */

import type { SessionType } from '../lib/mock/countdown-display-and-session-type';
import styles from './ProgressRing.module.css';

export interface ProgressRingProps {
  /** Seconds remaining */
  remainingSeconds: number;
  /** Total seconds of the current session */
  totalSeconds: number;
  /** Session type drives the ring colour */
  sessionType: SessionType;
  /** Accessible label for the SVG ring */
  ariaLabel?: string;
}

// SVG geometry — mirrors design/index.html
const VIEW_BOX = 260;
const CX = VIEW_BOX / 2;          // 130
const CY = VIEW_BOX / 2;          // 130
const R  = 118;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 741.23

export { CIRCUMFERENCE, CX, CY, R, STROKE_WIDTH, VIEW_BOX };

export default function ProgressRing({
  remainingSeconds,
  totalSeconds,
  sessionType,
  ariaLabel = 'Time remaining',
}: ProgressRingProps) {
  // Fraction of time remaining (1 = full, 0 = empty)
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  // dashoffset: 0 = full ring, CIRCUMFERENCE = empty ring
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Colour class per session type
  const colorClass =
    sessionType === 'short' ? styles.isGreen
    : sessionType === 'long' ? styles.isBlue
    : '';

  return (
    <div
      className={`${styles.ringWrap} ${colorClass}`}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
        role="img"
        aria-label={ariaLabel}
        className={styles.ringSvg}
      >
        {/* Track — always visible, muted */}
        <circle
          className={styles.ringTrack}
          cx={CX}
          cy={CY}
          r={R}
        />
        {/* Progress — coloured, shrinks as time elapses */}
        <circle
          className={styles.ringProgress}
          cx={CX}
          cy={CY}
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
}
