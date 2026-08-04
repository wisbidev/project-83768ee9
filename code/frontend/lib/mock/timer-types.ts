/**
 * Shared types for the Pomodoro Timer.
 * All story mock modules import from here so the types stay in sync.
 */

/** The three session types the timer supports. */
export type SessionType = 'work' | 'short' | 'long';

/** Timer status — mirrors the wall-clock state machine. */
export type TimerStatus = 'idle' | 'running' | 'paused';

/**
 * The complete timer state object.
 * This is the shape returned by the "get current session" endpoint
 * and passed down to display components.
 */
export interface TimerState {
  sessionType: SessionType;
  /** Seconds remaining in the current session (0 ≤ remaining ≤ total). */
  remainingSeconds: number;
  /** Total seconds of the current session; used to compute progress fraction. */
  totalSeconds: number;
  /** Current timer status. */
  status: TimerStatus;
}

// ─── Controls ─────────────────────────────────────────────────────────────────

/** What the Start/Pause button should show. */
export type StartLabel = 'Start' | 'Pause';

/** What the aria-pressed attribute on the Start/Pause button should be. */
export type AriaPressed = 'false' | 'true';

/** Derived controls state — computed from TimerState each render. */
export interface ControlsState {
  startLabel: StartLabel;
  ariaPressed: AriaPressed;
  isRunning: boolean;
}

/**
 * Derive controls display state from a TimerState snapshot.
 * Pure function — no side effects.
 */
export function deriveControls(state: TimerState): ControlsState {
  const { status } = state;

  if (status === 'running') {
    return { startLabel: 'Pause', ariaPressed: 'true',  isRunning: true  };
  }
  return     { startLabel: 'Start', ariaPressed: 'false', isRunning: false };
}
