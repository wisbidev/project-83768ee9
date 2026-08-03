'use client';

import styles from './SessionPill.module.css';
import type { SessionType } from '@/lib/mock/session-cycle-with-long-break';

interface SessionPillProps {
  type: SessionType;
  label: string;
  pulse?: boolean;
}

export default function SessionPill({ type, label, pulse = false }: SessionPillProps) {
  const colorClass =
    type === 'short' ? styles.isGreen
    : type === 'long'  ? styles.isBlue
    : '';

  return (
    <span
      className={`${styles.sessionPill} ${colorClass} ${pulse ? styles.pulse : ''}`}
      aria-live="polite"
      aria-label={`Session type: ${label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
