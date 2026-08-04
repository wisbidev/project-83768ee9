/**
 * Mock data — Countdown display and session type (Story 1)
 *
 * This module is the ONLY place mock data lives for this story.
 * Its shape is the contract the backend must satisfy.
 *
 * Initial state on page load:
 *   sessionType = 'work'
 *   remainingSeconds = 1500  (25 × 60)
 *   totalSeconds = 1500      (full duration — no time has elapsed)
 *   timerStatus = 'idle'    (not running; paused at full duration)
 */

import type { SessionType, TimerState } from './timer-types';

// ─── Domain types ─────────────────────────────────────────────────────────────

export type { SessionType } from './timer-types';

// ─── Initial session state ─────────────────────────────────────────────────────

/**
 * The timer state returned by the "get current session" API endpoint.
 * Shaped to match what a real API would return.
 */
export const INITIAL_TIMER_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: 25 * 60,   // 1500
  totalSeconds: 25 * 60,        // 1500 — full duration; no time elapsed yet
  status: 'idle',               // paused at full duration; nothing ticks yet
};

// ─── Session metadata ─────────────────────────────────────────────────────────

export interface SessionMeta {
  label: string;       // displayed in the pill, e.g. "Work"
  hint: string;        // sub-label below the countdown, e.g. "Stay focused"
  colorClass: string;  // CSS class applied to the pill / ring wrapper
}

/** Metadata for each session type — maps enum → display strings + colour class. */
export const SESSION_META: Record<SessionType, SessionMeta> = {
  work:  { label: 'Work',        hint: 'Stay focused',       colorClass: '' },
  short: { label: 'Short Break', hint: 'Grab a coffee',      colorClass: 'is-green' },
  long:  { label: 'Long Break',  hint: 'Take a real break',  colorClass: 'is-blue' },
};

// ─── Default durations ─────────────────────────────────────────────────────────

export const DEFAULT_DURATIONS = {
  work:  25,
  short:  5,
  long:  15,
} as const;
