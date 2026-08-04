/**
 * Mock data module — Countdown display and session type
 *
 * Shapes the expected API response for the timer card.
 * The real backend replaces only this file.
 *
 * Contract:
 * - TimerState is the authoritative shape returned by GET /timer
 * - formatTime() is the only allowed formatting function
 * - Loading and error states are required by every data-driven view
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short' | 'long';

export type TimerStatus = 'idle' | 'running' | 'paused';

/**
 * Timer card state — the shape returned by the API.
 * At load: status='idle', sessionType='work', remainingSeconds=1500.
 */
export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number; // seconds left; 0 means just finished
  totalSeconds: number;     // total duration of current session
  status: TimerStatus;      // idle | running | paused
}

/**
 * Loading state — shown while the initial data is being resolved.
 * API shape: null means "not yet loaded".
 */
export type LoadingState = null;

/**
 * Error state — shown when localStorage is unavailable or corrupted.
 * API shape: an object with an error flag and human-readable message.
 */
export interface ErrorState {
  error: true;
  message: string;
}

// ─── Session metadata (API surface) ──────────────────────────────────────────

/** Human-readable labels for each session type. */
export const SESSION_META: Record<SessionType, { name: string; hint: string }> = {
  work:  { name: 'Work',        hint: 'Stay focused' },
  short: { name: 'Short Break', hint: 'Grab a coffee' },
  long:  { name: 'Long Break',  hint: 'Take a real break' },
};

// ─── Default durations (seconds) ──────────────────────────────────────────────

/** Default session durations per SRS §3. Constants — no localStorage yet. */
export const DEFAULT_DURATIONS: Record<SessionType, number> = {
  work:  25 * 60, // 1500
  short:  5 * 60, // 300
  long:  15 * 60, // 900
};

// ─── Mock initial state ───────────────────────────────────────────────────────

/**
 * Timer state at page load: Work session at full 25 minutes, idle.
 * status='idle' means the countdown has never been started.
 */
export const MOCK_INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: DEFAULT_DURATIONS.work, // 1500
  totalSeconds: DEFAULT_DURATIONS.work,
  status: 'idle',
};

// ─── Mock short break (for future cycle advancement) ─────────────────────────

export const MOCK_SHORT_BREAK_STATE: TimerState = {
  sessionType: 'short',
  remainingSeconds: DEFAULT_DURATIONS.short, // 300
  totalSeconds: DEFAULT_DURATIONS.short,
  status: 'idle',
};

// ─── Mock long break (for future cycle advancement) ──────────────────────────

export const MOCK_LONG_BREAK_STATE: TimerState = {
  sessionType: 'long',
  remainingSeconds: DEFAULT_DURATIONS.long, // 900
  totalSeconds: DEFAULT_DURATIONS.long,
  status: 'idle',
};

// ─── Loading state ───────────────────────────────────────────────────────────

/** API returns null before the initial state is resolved. */
export const MOCK_LOADING_STATE: LoadingState = null;

// ─── Error state ─────────────────────────────────────────────────────────────

/**
 * Fallback state when localStorage is unavailable or holds corrupted data.
 * The page must never crash — it shows Work / 25:00 and logs the error.
 */
export const MOCK_ERROR_STATE: ErrorState = {
  error: true,
  message: 'Could not load timer settings. Showing default values.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format seconds as MM:SS with zero-padded minutes and seconds.
 * Examples: 1500 → "25:00", 300 → "05:00", 65 → "01:05".
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Fraction of time remaining, used to drive the SVG progress ring.
 * Returns 1.0 when fully loaded (all time remaining), 0.0 when just finished.
 */
export function progressFraction(state: TimerState): number {
  if (state.totalSeconds === 0) return 1;
  return Math.max(0, Math.min(1, state.remainingSeconds / state.totalSeconds));
}
