'use client';

import { useEffect, useRef } from 'react';
import styles from './ProgressRing.module.css';
import type { SessionType } from '@/lib/mock/session-cycle-with-long-break';

const RADIUS = 118;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 741.76

interface ProgressRingProps {
  type: SessionType;
  remainingSeconds: number;
  totalSeconds: number;
  running: boolean;
  hint: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ProgressRing({
  type,
  remainingSeconds,
  totalSeconds,
  running,
  hint,
}: ProgressRingProps) {
  const progressRef = useRef<SVGCircleElement>(null);

  // Update stroke-dashoffset whenever remaining/total change
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
    const offset = CIRCUMFERENCE * (1 - progress);
    el.style.strokeDashoffset = String(offset);
  }, [remainingSeconds, totalSeconds]);

  const colourClass =
    type === 'short' ? styles.isGreen
    : type === 'long'  ? styles.isBlue
    : '';

  const stateClass = [
    styles.wrap,
    colourClass,
    running ? styles.isRunning : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={stateClass} aria-live="polite">
      <svg viewBox="0 0 260 260" role="img" aria-label={`Time remaining: ${formatTime(remainingSeconds)}`}>
        <circle
          ref={progressRef}
          className={styles.progress}
          cx="130"
          cy="130"
          r={RADIUS}
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: 0 }}
        />
        <circle className={styles.track} cx="130" cy="130" r={RADIUS} />
      </svg>

      <div className={styles.center}>
        <div className={styles.time} aria-live="off">
          {formatTime(remainingSeconds)}
        </div>
        <div className={styles.hint}>{hint}</div>
        <span className={styles.pausedBadge}>Paused</span>
      </div>
    </div>
  );
}
