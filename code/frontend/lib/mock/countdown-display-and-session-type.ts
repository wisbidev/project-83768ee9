/**
 * Mock data module — Countdown display and session type
 *
 * Shape mirrors the API contract the backend must satisfy.
 * Replace this file to wire real API calls; no other file needs changing.
 */

// ── Domain types ──────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short' | 'long';

export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number;
  /** Total session duration in seconds — used to compute ring progress */
  totalSeconds: number;
  /** idle = paused at full duration, no ticking yet */
  status: 'idle' | 'running' | 'paused';
}

export interface SessionMeta {
  label: string;
  hint: string;
  pillClass: string;
  ringClass: string;
}

// ── Session metadata ───────────────────────────────────────────────────────────

export const SESSION_META: Record<SessionType, SessionMeta> = {
  work: {
    label: 'Work',
    hint: 'Stay focused',
    pillClass: '',
    ringClass: '',
  },
  short: {
    label: 'Short Break',
    hint: 'Grab a coffee',
    pillClass: 'is-green',
    ringClass: 'is-green',
  },
  long: {
    label: 'Long Break',
    hint: 'Take a real break',
    pillClass: 'is-blue',
    ringClass: 'is-blue',
  },
};

// ── Duration constants ─────────────────────────────────────────────────────────

export const DEFAULT_WORK_DURATION_MINUTES = 25;

export const DURATIONS: Record<SessionType, number> = {
  work:  DEFAULT_WORK_DURATION_MINUTES * 60, // 1500 s
  short: 5  * 60,                             // 300 s
  long:  15 * 60,                             // 900 s
};

// ── Initial state ─────────────────────────────────────────────────────────────

export const INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: DURATIONS.work,
  totalSeconds: DURATIONS.work,
  status: 'idle',
};

// ── API response shapes ────────────────────────────────────────────────────────

/** Successful response */
export interface TimerResponse {
  data: TimerState;
}

/** Loading state */
export interface LoadingState {
  loading: true;
}

/** Error state */
export interface ErrorState {
  error: true;
  message: string;
}

/** Union of all possible API result shapes */
export type TimerResult = TimerResponse | LoadingState | ErrorState;

// ── Mock fetch helpers ─────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns the initial timer state after a simulated network delay */
export async function fetchInitialTimer(): Promise<TimerResponse> {
  await delay(400);
  return { data: { ...INITIAL_STATE } };
}

/** Returns a loading state */
export async function fetchTimerLoading(): Promise<LoadingState> {
  await delay(0);
  return { loading: true };
}

/** Returns an error state */
export async function fetchTimerError(): Promise<ErrorState> {
  await delay(300);
  return { error: true, message: 'Unable to load timer. Please refresh.' };
}

// ── Format helpers ─────────────────────────────────────────────────────────────

/** Format seconds as MM:SS with zero-padded minutes and seconds */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
