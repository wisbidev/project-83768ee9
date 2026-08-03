/**
 * Mock data module — Start, pause and reset controls
 *
 * Shapes the expected state of the timer controls.
 * The real implementation replaces only this file.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short' | 'long';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus;
}

export interface ControlsState {
  startLabel: string;       // 'Start' | 'Pause'
  ariaPressed: boolean;
  isRunning: boolean;
  showPausedBadge: boolean;  // only true when paused AND time has been consumed
}

// ─── Session metadata ─────────────────────────────────────────────────────────

export const SESSION_META: Record<SessionType, { name: string; hint: string }> = {
  work:  { name: 'Work',       hint: 'Stay focused' },
  short: { name: 'Short Break', hint: 'Grab a coffee' },
  long:  { name: 'Long Break',  hint: 'Take a real break' },
};

// ─── Default durations (seconds) ─────────────────────────────────────────────

export const DEFAULT_DURATIONS: Record<SessionType, number> = {
  work:  25 * 60, // 1500
  short:  5 * 60, // 300
  long:  15 * 60, // 900
};

// ─── Mock initial state ───────────────────────────────────────────────────────

/**
 * Initial timer state: Work session at full 25 minutes, paused.
 * This is the "idle" state — not running, but not a resumed-pause either.
 */
export const MOCK_INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: DEFAULT_DURATIONS.work,
  totalSeconds: DEFAULT_DURATIONS.work,
  status: 'paused',  // paused at full duration = idle equivalent
};

/**
 * Controls derived from initial state.
 * Start button reads "Start", aria-pressed=false, no paused badge.
 */
export const MOCK_INITIAL_CONTROLS: ControlsState = {
  startLabel: 'Start',
  ariaPressed: false,
  isRunning: false,
  showPausedBadge: false,
};

// ─── Mock running state (mid-session) ─────────────────────────────────────────

/**
 * Timer in the middle of a work session.
 * Used to test the "running" visual state (ink background, aria-pressed=true).
 */
export const MOCK_RUNNING_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: 12 * 60 + 30, // 12:30
  totalSeconds: DEFAULT_DURATIONS.work,
  status: 'running',
};

/**
 * Controls for a running session.
 * Button reads "Pause", aria-pressed=true, no paused badge.
 */
export const MOCK_RUNNING_CONTROLS: ControlsState = {
  startLabel: 'Pause',
  ariaPressed: true,
  isRunning: true,
  showPausedBadge: false,
};

// ─── Mock paused state (time consumed) ───────────────────────────────────────

/**
 * Timer paused after time has been consumed.
 * This is the state where the "Paused" badge should be visible.
 */
export const MOCK_PAUSED_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: 12 * 60 + 30, // 12:30 — same as running, but paused
  totalSeconds: DEFAULT_DURATIONS.work,
  status: 'paused',
};

/**
 * Controls for a paused mid-session.
 * Button reads "Start", aria-pressed=false, paused badge VISIBLE.
 */
export const MOCK_PAUSED_CONTROLS: ControlsState = {
  startLabel: 'Start',
  ariaPressed: false,
  isRunning: false,
  showPausedBadge: true, // time consumed → badge shows
};

// ─── Mock short break ─────────────────────────────────────────────────────────

export const MOCK_SHORT_BREAK_STATE: TimerState = {
  sessionType: 'short',
  remainingSeconds: DEFAULT_DURATIONS.short,
  totalSeconds: DEFAULT_DURATIONS.short,
  status: 'paused',
};

// ─── Mock long break ──────────────────────────────────────────────────────────

export const MOCK_LONG_BREAK_STATE: TimerState = {
  sessionType: 'long',
  remainingSeconds: DEFAULT_DURATIONS.long,
  totalSeconds: DEFAULT_DURATIONS.long,
  status: 'paused',
};

// ─── Loading state ────────────────────────────────────────────────────────────

export const MOCK_LOADING_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: 0,
  totalSeconds: 0,
  status: 'idle',
};

// ─── Error state ──────────────────────────────────────────────────────────────

export interface ErrorState {
  error: true;
  message: string;
}

export const MOCK_ERROR_STATE: ErrorState = {
  error: true,
  message: 'Could not load timer settings. Please refresh.',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function deriveControls(state: TimerState): ControlsState {
  const isRunning = state.status === 'running';
  const hasConsumedTime = state.remainingSeconds < state.totalSeconds;

  return {
    startLabel: isRunning ? 'Pause' : 'Start',
    ariaPressed: isRunning,
    isRunning,
    showPausedBadge: state.status === 'paused' && hasConsumedTime,
  };
}
