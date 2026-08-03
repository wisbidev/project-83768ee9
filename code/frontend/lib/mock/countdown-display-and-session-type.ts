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
  /** Whether the timer is actively counting down (idle = paused at full duration) */
  status: 'idle' | 'running' | 'paused';
  /** Total session duration in seconds (for ring progress calculation) */
  totalSeconds: number;
}

export interface SessionMeta {
  label: string;
  hint: string;
  pillClass: string;
  ringClass: string;
}

// ── Session metadata ─────────────────────────────────────────────────────────

export const SESSION_META: Record<SessionType, SessionMeta> = {
  work:  { label: 'Work',        hint: 'Stay focused',    pillClass: '',        ringClass: ''        },
  short: { label: 'Short Break', hint: 'Grab a coffee',   pillClass: 'is-green', ringClass: 'is-green' },
  long:  { label: 'Long Break',  hint: 'Take a real break', pillClass: 'is-blue',  ringClass: 'is-blue'  },
};

// ── Duration constants (from SRS) ────────────────────────────────────────────

export const DURATIONS: Record<SessionType, number> = {
  work:  25 * 60, // 1500 s
  short:  5 * 60, //  300 s
  long:  15 * 60, //  900 s
};

// ── Initial load state ────────────────────────────────────────────────────────

export const INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: DURATIONS.work,
  status: 'idle',
  totalSeconds: DURATIONS.work,
};

// ── Mock API response shapes ─────────────────────────────────────────────────

/** Successful response — single timer state */
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

export type TimerResult = TimerResponse | LoadingState | ErrorState;

// ── Mock fetch helpers ────────────────────────────────────────────────────────

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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
