'use client';

/**
 * CountdownDisplay — Session type pill, SVG progress ring, and MM:SS countdown.
 *
 * This is the first story: it renders the timer card in its initial idle state.
 * No ticking, no controls, no session cycling yet — those belong to later stories.
 *
 * All state lives here (client component); page.tsx is a Server Component that
 * only composes it.
 *
 * Mock data shape is defined in lib/mock/countdown-display-and-session-type.ts.
 * Replacing the import path swaps mock data for a real API call.
 */

import { useState } from 'react';
import {
  MOCK_INITIAL_STATE,
  MOCK_LOADING_STATE,
  MOCK_ERROR_STATE,
  SESSION_META,
  formatTime,
  progressFraction,
  type TimerState,
  type LoadingState,
  type ErrorState,
} from '../lib/mock/countdown-display-and-session-type';
import styles from './CountdownDisplay.module.css';

// ─── SVG ring constants ───────────────────────────────────────────────────────

const RING_RADIUS = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 741.24

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CountdownDisplayProps {
  /**
   * Override the initial state for story testing.
   * In production, this component manages its own state from the mock/API.
   */
  initialState?: TimerState;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CountdownDisplay({
  initialState,
}: CountdownDisplayProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  //
  // The three possible states mirror the API response envelope:
  //   { TimerState }  → success, show countdown
  //   null            → loading
  //   { error }       → error fallback
  //
  // In a real app these would come from a useQuery / fetch call.
  // Here they are toggled via React state so the loading / error UI is
  // exercised during development and QA.

  const [state, setState] = useState<TimerState | LoadingState | ErrorState>(
    initialState ?? MOCK_INITIAL_STATE
  );

  // ── Derived values ───────────────────────────────────────────────────────

  const isLoading = state === null;
  const isError   = typeof state === 'object' && 'error' in state;
  const timer     = !isLoading && !isError ? (state as TimerState) : null;

  const sessionMeta = timer ? SESSION_META[timer.sessionType] : null;
  const displayTime = timer ? formatTime(timer.remainingSeconds) : null;

  // Progress ring stroke-dashoffset: 0 = full ring (100 % remaining), full dasharray = empty.
  const dashOffset = timer
    ? RING_CIRCUMFERENCE * (1 - progressFraction(timer))
    : 0;

  // ── Pill colour variant ──────────────────────────────────────────────────

  const pillClass = [
    styles.pill,
    timer?.sessionType === 'short' ? styles.isShort : '',
    timer?.sessionType === 'long'  ? styles.isLong  : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Ring colour variant ─────────────────────────────────────────────────

  const ringWrapClass = [
    styles.ringWrap,
    timer?.sessionType === 'short' ? styles.ringWrapShort : '',
    timer?.sessionType === 'long'  ? styles.ringWrapLong  : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      className={styles.card}
      aria-label="Timer"
      role="region"
    >
      {/* Session type pill */}
      {timer && (
        <span
          className={pillClass}
          id="sessionPill"
          aria-label={`Session type: ${sessionMeta?.name}`}
        >
          <span className={styles.pillDot} aria-hidden="true" />
          {sessionMeta?.name}
        </span>
      )}

      {/* Progress ring */}
      <div className={ringWrapClass} aria-hidden="true">
        <svg viewBox={`0 0 ${RING_RADIUS * 2} ${RING_RADIUS * 2}`}>
          {/* Track (background circle) */}
          <circle
            className={styles.ringTrack}
            cx={RING_RADIUS}
            cy={RING_RADIUS}
            r={RING_RADIUS}
          />
          {/* Progress (foreground arc) */}
          {!isLoading && !isError && (
            <circle
              className={styles.ringProgress}
              cx={RING_RADIUS}
              cy={RING_RADIUS}
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>

        {/* Time readout centered inside the ring */}
        <div className={styles.timeCenter}>
          {isLoading ? (
            <>
              {/* Shimmer skeleton — same dimensions as the time display */}
              <span className={`${styles.skeleton} ${styles.skeletonTime}`} />
              <span className={`${styles.skeleton} ${styles.skeletonSub}`} />
            </>
          ) : isError ? (
            <span className={styles.time} aria-hidden="true">
              ??:??
            </span>
          ) : (
            <>
              <span
                className={styles.time}
                id="timeDisplay"
                aria-live="off"
                aria-label={`${displayTime} remaining`}
              >
                {displayTime}
              </span>
              <span className={styles.timeSub} id="sessionHint">
                {sessionMeta?.hint}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Accessibility: describe the ring to screen readers */}
      {!isLoading && !isError && timer && (
        <span className="sr-only">
          {progressFraction(timer) === 1
            ? `Timer ready. ${sessionMeta?.name} session, ${displayTime} remaining.`
            : `${progressFraction(timer) * 100}% of ${sessionMeta?.name} session remaining.`}
        </span>
      )}
    </section>
  );
}
