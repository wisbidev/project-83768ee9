/**
 * Mock data module — Session cycle with long break
 *
 * This file shapes the expected state of the timer.
 * The real implementation replaces only this file.
 */

// Session type enum
export type SessionType = 'work' | 'short' | 'long';

// Session metadata
export interface SessionMeta {
  name: string;
  hint: string;
  pillClass: string;        // CSS class for the pill colour
  ringClass: string;        // CSS class for the ring colour
  toastVariant: 'tomato' | 'green' | 'blue';
}

export const SESSION_META: Record<SessionType, SessionMeta> = {
  work: {
    name: 'Work',
    hint: 'Stay focused',
    pillClass: 'bg-tomato-soft text-tomato',
    ringClass: 'text-primary',
    toastVariant: 'tomato',
  },
  short: {
    name: 'Short Break',
    hint: 'Grab a coffee',
    pillClass: 'bg-short-soft text-short',
    ringClass: 'text-short',
    toastVariant: 'green',
  },
  long: {
    name: 'Long Break',
    hint: 'Take a real break',
    pillClass: 'bg-long-soft text-long',
    ringClass: 'text-long',
    toastVariant: 'blue',
  },
};

// Toast messages per transition
export interface ToastMessage {
  text: string;
  variant: 'tomato' | 'green' | 'blue';
}

export const TOAST_MESSAGES: Record<string, ToastMessage> = {
  'work->short': { text: 'Work complete — time for a short break!', variant: 'green' },
  'work->long':  { text: 'Cycle complete! You earned a long break.', variant: 'blue' },
  'short->work': { text: 'Break over — back to work.', variant: 'tomato' },
  'long->work':  { text: 'Break over — back to work.', variant: 'tomato' },
};

// Default durations (seconds)
export const DEFAULT_DURATIONS: Record<SessionType, number> = {
  work:  25 * 60, // 1500
  short:  5 * 60, // 300
  long:  15 * 60, // 900
};

// Timer state shape (what the "API" would return)
export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  cyclePosition: number;   // 1–4: which session in the 4-session cycle
  workSessionsDone: number; // completed work sessions in current cycle (0–3)
  isPaused: boolean;
}

// Mock initial state
export const MOCK_INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: DEFAULT_DURATIONS.work,
  totalSeconds: DEFAULT_DURATIONS.work,
  isRunning: false,
  cyclePosition: 1,
  workSessionsDone: 0,
  isPaused: true,
};

// Cycle dot state
export type DotState = 'done' | 'active' | 'empty';

export interface CycleDotState {
  position: number; // 1–4
  state: DotState;
}

// Helper: derive dot states from cycle position and work sessions done
export function deriveCycleDots(
  cyclePosition: number,
  workSessionsDone: number
): CycleDotState[] {
  return [1, 2, 3, 4].map((pos) => {
    if (pos <= workSessionsDone) {
      return { position: pos, state: 'done' as DotState };
    }
    if (pos === cyclePosition) {
      return { position: pos, state: 'active' as DotState };
    }
    return { position: pos, state: 'empty' as DotState };
  });
}

// Session label
export function cycleLabelText(position: number): string {
  return `Session ${position} of 4`;
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Advance to next session type based on cycle rules
export function getNextSessionType(
  currentType: SessionType,
  workSessionsDone: number
): SessionType {
  if (currentType === 'work') {
    // After 4th work session → long break
    if (workSessionsDone >= 3) return 'long';
    return 'short';
  }
  // After any break → back to work
  return 'work';
}

// Get toast message for a transition
export function getToastMessage(
  fromType: SessionType,
  toType: SessionType
): ToastMessage | null {
  const key = `${fromType}->${toType}`;
  return TOAST_MESSAGES[key] ?? null;
}

// Loading state mock
export const MOCK_LOADING_STATE: TimerState = {
  ...MOCK_INITIAL_STATE,
  remainingSeconds: 0,
  totalSeconds: 0,
  isRunning: false,
  isPaused: false,
};

// Error state mock (would come from failed API call)
export interface ErrorState {
  error: true;
  message: string;
}

export const MOCK_ERROR_STATE: ErrorState = {
  error: true,
  message: 'Could not load timer settings. Please refresh.',
};
