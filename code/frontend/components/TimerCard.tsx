'use client';

import { useEffect, useState } from 'react';
import {
  SESSION_META,
  DEFAULT_WORK_DURATION_MINUTES,
  formatTime,
  type SessionType,
  type TimerResult,
} from '@/lib/mock/countdown-display-and-session-type';
import styles from './TimerCard.module.css';

// Ring geometry — matches design/index.html
const RING_SIZE = 260;
const RING_R = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 741.76

interface TimerCardProps {
  /** Override the initial result — used by tests to inject loading/error states */
  initialResult?: TimerResult;
}

export default function TimerCard({ initialResult }: TimerCardProps) {
  const [sessionType] = useState<SessionType>('work');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    DEFAULT_WORK_DURATION_MINUTES * 60
  );
  const [result, setResult] = useState<TimerResult | null>(
    initialResult ?? null
  );

  // Safe load from localStorage on mount
  useEffect(() => {
    if (initialResult !== undefined) return; // test override: skip fetch

    try {
      const raw = localStorage.getItem('pomodoro_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.workDuration && Number.isInteger(parsed.workDuration) && parsed.workDuration > 0) {
          const dur = parsed.workDuration * 60;
          setRemainingSeconds(dur);
        }
      }
    } catch {
      // Corrupted storage — fall through to defaults; page never crashes
    }
  }, [initialResult]);

  const meta = SESSION_META[sessionType];

  // Total = remaining when idle (not ticking yet)
  const totalSeconds = remainingSeconds;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const strokeColor =
    sessionType === 'short'
      ? '#2F9E77'
      : sessionType === 'long'
      ? '#3B6FE0'
      : '#E4572E';

  const progressClass =
    sessionType === 'short'
      ? styles.progressGreen
      : sessionType === 'long'
      ? styles.progressBlue
      : '';

  const timeDisplay = formatTime(remainingSeconds);

  // ── State renders ─────────────────────────────────────────────────────────

  if (result && 'loading' in result) {
    return (
      <section className={styles.card} aria-label="Timer" aria-busy="true">
        <LoadingSkeleton />
      </section>
    );
  }

  if (result && 'error' in result) {
    return (
      <section className={styles.card} aria-label="Timer">
        <ErrorState message={result.message} onRetry={() => setResult(null)} />
      </section>
    );
  }

  // ── Default: Work / 25:00 ──────────────────────────────────────────────────

  return (
    <section
      className={`${styles.card} ${styles.isPaused}`}
      aria-label="Timer"
    >
      {/* Session pill */}
      <span
        className={`session-pill ${sessionType === 'short' ? 'is-green' : sessionType === 'long' ? 'is-blue' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '7px 16px',
          borderRadius: '999px',
          background:
            sessionType === 'short'
              ? '#DDF0E8'
              : sessionType === 'long'
              ? '#DDE7FB'
              : '#FCE4D8',
          color:
            sessionType === 'short'
              ? '#2F9E77'
              : sessionType === 'long'
              ? '#3B6FE0'
              : '#C74420',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          className="dot"
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'currentColor',
          }}
          aria-hidden="true"
        />
        <span id="sessionName">{meta.label}</span>
      </span>

      {/* Ring */}
      <div className={styles.ringWrap} aria-hidden="true">
        <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} role="img" aria-label={`Time remaining ring, ${timeDisplay}`}>
          <circle className={styles.track} cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} />
          <circle
            className={`${styles.progress} ${progressClass}`}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke={strokeColor}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Time centre */}
        <div className={styles.center}>
          <div
            className={styles.time}
            aria-live="polite"
            aria-atomic="true"
          >
            {timeDisplay}
          </div>
          <div className={styles.hint}>{meta.hint}</div>
          <span className={styles.pausedBadge}>Paused</span>
        </div>
      </div>
    </section>
  );
}

// ── State sub-components ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-10" aria-hidden="true">
      {/* Pill skeleton */}
      <div className="w-28 h-6 rounded-full bg-[#F1E7DB] animate-pulse" />
      {/* Ring skeleton */}
      <div className="w-[260px] h-[260px] rounded-full bg-[#F1E7DB] animate-pulse" />
      {/* Time skeleton */}
      <div className="w-40 h-14 rounded-xl bg-[#F1E7DB] animate-pulse mt-4" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-12">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E4572E"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm text-ink max-w-[280px] text-center leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-primary transition-colors hover:bg-[#C74420] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Try again
      </button>
    </div>
  );
}
