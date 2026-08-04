'use client';

/**
 * SessionPill — displays the current session type as a coloured badge.
 *
 * Colours:
 *   Work       → tomato   (--color-primary / bg-primary)
 *   Short Break → green   (--color-short / bg-short)
 *   Long Break  → blue    (--color-long / bg-long)
 *
 * No animation in this story (the pulse belongs to the running state, story 2).
 */

import type { SessionType } from '../lib/mock/countdown-display-and-session-type';
import { SESSION_META } from '../lib/mock/countdown-display-and-session-type';
import styles from './SessionPill.module.css';

export interface SessionPillProps {
  sessionType: SessionType;
  /** aria-label override; defaults to the session label. */
  ariaLabel?: string;
}

export default function SessionPill({ sessionType, ariaLabel }: SessionPillProps) {
  const meta = SESSION_META[sessionType];

  const variantClass =
    sessionType === 'short' ? styles.isGreen
    : sessionType === 'long' ? styles.isBlue
    : '';

  return (
    <span
      className={`${styles.pill} ${variantClass}`}
      aria-label={ariaLabel ?? meta.name}
    >
      <span className={styles.dot} aria-hidden="true" />
      {meta.name}
    </span>
  );
}
