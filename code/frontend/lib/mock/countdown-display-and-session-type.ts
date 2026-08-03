/**
 * Mock data for the Countdown display and session type story.
 * Shape matches the API contract the backend must satisfy.
 */

export type SessionType = 'work' | 'short' | 'long';

export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number;
  totalSeconds: number;
  status: 'idle' | 'running' | 'paused';
}

export interface SessionMeta {
  label: string;
  hint: string;
  pillClass: string;
  ringClass: string;
}

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

// Default initial state: Work session at 25:00, idle
export const DEFAULT_WORK_DURATION_MINUTES = 25;

export function buildInitialState(): TimerState {
  const totalSeconds = DEFAULT_WORK_DURATION_MINUTES * 60;
  return {
    sessionType: 'work',
    remainingSeconds: totalSeconds,
    totalSeconds,
    status: 'idle',
  };
}

// Helper to format seconds as MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
