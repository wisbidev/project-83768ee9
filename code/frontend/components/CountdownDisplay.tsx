'use client';

/**
 * CountdownDisplay — MM:SS readout with session hint label.
 *
 * Formats `remainingSeconds` as zero-padded MM:SS (e.g. 25:00, 05:00).
 * The hint label (e.g. "Stay focused") comes from SESSION_META.
 *
 * No ticking in this story — AC-2 verifies the value is static.
 */

import type { SessionType } from '../lib/mock/countdown-display-and-session-type';
import { SESSION_META } from '../lib/mock/countdown-display-and-session-type';
import styles from './CountdownDisplay.module.css';

export interface CountdownDisplayProps {
  remainingSeconds: number;
  sessionType: SessionType;
  /** aria-live strategy — 'off' because the value doesn't update in this story */
  ariaLive?: 'off' | 'polite' | 'assertive';
}

/**
 * Format seconds as zero-padded MM:SS.
 * Examples: 1500 → "25:00", 300 → "05:00", 65 → "01:05"
 */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CountdownDisplay({
  remainingSeconds,
  sessionType,
  ariaLive = 'off',
}: CountdownDisplayProps) {
  const hint = SESSION_META[sessionType].hint;
  const timeStr = formatTime(remainingSeconds);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.time}
        aria-live={ariaLive}
        aria-atomic="true"
        role="timer"
      >
        {timeStr}
      </div>
      <div className={styles.hint}>{hint}</div>
    </div>
  );
}
