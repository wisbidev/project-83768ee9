/**
 * Mock data module for Session Cycle with Long Break.
 *
 * Shape is the contract the backend must satisfy when this story's
 * API stage is implemented.  All mock data lives here — the component
 * layer imports nothing else from this file.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short' | 'long';

export interface SessionMeta {
  name: string;
  label: string;
  hint: string;
  pillClass: string;      // CSS class for the session-type pill
  ringClass: string;      // CSS class modifier for the progress-ring wrapper
  toastVariant: 'tomato' | 'green' | 'blue';
}

export interface TimerSettings {
  work: number;   // minutes
  short: number;  // minutes
  long: number;   // minutes
}

export interface CycleState {
  /** 0-3: how many work sessions have completed in the current 4-session cycle */
  position: number;
  /** Total sessions in the cycle (always 4) */
  total: number;
}

export interface SessionCycleState {
  type: SessionType;
  remainingSeconds: number;
  totalSeconds: number;
  running: boolean;
  cycle: CycleState;
  settings: TimerSettings;
}

// ─── Static metadata (mirrors the design system tokens) ─────────────────────

export const SESSION_META: Record<SessionType, SessionMeta> = {
  work: {
    name: 'Work',
    label: 'Work',
    hint: 'Stay focused',
    pillClass: '',          // tomato — the base class (no modifier)
    ringClass: '',           // tomato — the base class (no modifier)
    toastVariant: 'tomato',
  },
  short: {
    name: 'Short Break',
    label: 'Short Break',
    hint: 'Grab a coffee',
    pillClass: 'is-green',
    ringClass: 'is-green',
    toastVariant: 'green',
  },
  long: {
    name: 'Long Break',
    label: 'Long Break',
    hint: 'Take a real break',
    pillClass: 'is-blue',
    ringClass: 'is-blue',
    toastVariant: 'blue',
  },
};

// ─── Mock initial state ───────────────────────────────────────────────────────

/** Initial state the timer renders with before any interaction. */
export const MOCK_INITIAL_STATE: SessionCycleState = {
  type: 'work',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  running: false,
  cycle: { position: 0, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

// ─── Mock advance scenarios (for development / QA preview) ──────────────────

/** After completing the 1st work session → Short Break */
export const MOCK_AFTER_WORK_1: SessionCycleState = {
  type: 'short',
  remainingSeconds: 5 * 60,
  totalSeconds: 5 * 60,
  running: false,
  cycle: { position: 1, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

/** Mid-cycle: after completing 2 work sessions → Work, session 3 of 4 */
export const MOCK_MID_CYCLE: SessionCycleState = {
  type: 'work',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  running: false,
  cycle: { position: 2, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

/** After completing 3rd work session → Short Break (position 3/4) */
export const MOCK_AFTER_WORK_3: SessionCycleState = {
  type: 'short',
  remainingSeconds: 5 * 60,
  totalSeconds: 5 * 60,
  running: false,
  cycle: { position: 3, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

/** After completing 4th work session → Long Break */
export const MOCK_AFTER_WORK_4: SessionCycleState = {
  type: 'long',
  remainingSeconds: 15 * 60,
  totalSeconds: 15 * 60,
  running: false,
  cycle: { position: 4, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

/** After Long Break completes → cycle restarts at Work, session 1 of 4 */
export const MOCK_AFTER_LONG_BREAK: SessionCycleState = {
  type: 'work',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  running: false,
  cycle: { position: 0, total: 4 },
  settings: { work: 25, short: 5, long: 15 },
};

// ─── Toast messages ───────────────────────────────────────────────────────────

export interface ToastMessage {
  message: string;
  variant: 'tomato' | 'green' | 'blue';
}

export const TOAST_WORK_COMPLETE_SHORT: ToastMessage = {
  message: 'Work complete — time for a short break!',
  variant: 'green',
};

export const TOAST_WORK_COMPLETE_LONG: ToastMessage = {
  message: 'Cycle complete! You earned a long break.',
  variant: 'blue',
};

export const TOAST_BREAK_OVER: ToastMessage = {
  message: 'Break over — back to work.',
  variant: 'tomato',
};
