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

import {
  MOCK_INITIAL_STATE,
  SESSION_META,
  formatTime,
  type SessionType,
} from '../lib/mock/countdown-display-and-session-type';
import styles from './CountdownDisplay.module.css';

// ─── SVG ring constants ───────────────────────────────────────────────────────

const RING_RADIUS = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 741.24

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CountdownDisplayProps {
  /** Seconds remaining in the current session. */
  remainingSeconds: number;
  /** Total seconds of the current session. */
  totalSeconds: number;
  /** Current session type — drives pill colour and ring colour. */
  sessionType: SessionType;
  /**
   * Override the initial state for story testing.
   * When provided, props above are derived from this state object.
   */
  initialState?: { sessionType: SessionType; remainingSeconds: number; totalSeconds: number };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CountdownDisplay({
  remainingSeconds,
  totalSeconds,
  sessionType,
  initialState,
}: CountdownDisplayProps) {
  // Allow tests to inject a different initial state
  const resolvedSessionType =
    initialState?.sessionType ?? sessionType ?? MOCK_INITIAL_STATE.sessionType;
  const resolvedRemaining =
    initialState?.remainingSeconds ?? remainingSeconds ?? MOCK_INITIAL_STATE.remainingSeconds;
  const resolvedTotal =
    initialState?.totalSeconds ?? totalSeconds ?? MOCK_INITIAL_STATE.totalSeconds;

  const sessionMeta = SESSION_META[resolvedSessionType];
  const displayTime = formatTime(resolvedRemaining);

  // Progress ring: 1 = full ring, 0 = empty
  const progress =
    resolvedTotal > 0 ? resolvedRemaining / resolvedTotal : 1;
  const dashOffset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

  // ── Pill colour variant ──────────────────────────────────────────────────

  const pillClass = [
    styles.pill,
    resolvedSessionType === 'short' ? styles.isShort : '',
    resolvedSessionType === 'long'  ? styles.isLong  : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Ring colour variant ─────────────────────────────────────────────────

  const ringWrapClass = [
    styles.ringWrap,
    resolvedSessionType === 'short' ? styles.ringWrapShort : '',
    resolvedSessionType === 'long'  ? styles.ringWrapLong  : '',
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
      <span
        className={pillClass}
        id="sessionPill"
        aria-label={`Session type: ${sessionMeta.name}`}
      >
        <span className={styles.pillDot} aria-hidden="true" />
        {sessionMeta.name}
      </span>

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
          <circle
            className={styles.ringProgress}
            cx={RING_RADIUS}
            cy={RING_RADIUS}
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Time readout centred inside the ring */}
        <div className={styles.timeCenter}>
          <span
            className={styles.time}
            id="timeDisplay"
            aria-live="off"
            aria-label={`${displayTime} remaining`}
          >
            {displayTime}
          </span>
          <span className={styles.timeSub} id="sessionHint">
            {sessionMeta.hint}
          </span>
        </div>
      </div>

      {/* Accessibility: describe the ring to screen readers */}
      <span className="sr-only">
        {progress === 1
          ? `Timer ready. ${sessionMeta.name} session, ${displayTime} remaining.`
          : `${Math.round(progress * 100)}% of ${sessionMeta.name} session remaining.`}
      </span>
    </section>
  );
}
