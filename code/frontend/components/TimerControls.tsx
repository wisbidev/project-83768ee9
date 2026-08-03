'use client';

/**
 * TimerControls — Start, Pause and Reset controls with keyboard shortcuts
 *
 * Accepts external session state (type, duration) and drives the countdown
 * using wall-clock timestamps (Date.now()), so the timer stays accurate
 * even when the tab is in the background.
 *
 * The countdown counts down only while `running === true`.
 * Reset restores the current session to its full duration and leaves it paused.
 * The session type is never changed by these controls.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MOCK_INITIAL_STATE,
  MOCK_INITIAL_CONTROLS,
  deriveControls,
  formatTime,
  type SessionType,
  type TimerState,
  type ControlsState,
  DEFAULT_DURATIONS,
} from '../lib/mock/start-pause-and-reset-controls';
import styles from './TimerControls.module.css';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface TimerControlsProps {
  /**
   * The session type whose duration this timer uses for reset.
   * Can be changed externally; this component never changes it.
   */
  sessionType?: SessionType;
  /**
   * Whether to show the keyboard shortcut footer hint.
   * @default true
   */
  showFooter?: boolean;
  /**
   * Callback fired each second with the current remaining seconds.
   * Use to drive external display components (progress ring, pill, etc.).
   */
  onTick?: (remainingSeconds: number) => void;
  /**
   * Callback fired when the countdown reaches 0.
   */
  onSessionEnd?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sessionDuration(type: SessionType): number {
  return (
    type === 'work'  ? DEFAULT_DURATIONS.work
    : type === 'short' ? DEFAULT_DURATIONS.short
    : DEFAULT_DURATIONS.long
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimerControls({
  sessionType: externalType,
  showFooter = true,
  onTick,
  onSessionEnd,
}: TimerControlsProps) {
  // ── Timer state ──────────────────────────────────────────────────────────
  const [sessionType] = useState<SessionType>(externalType ?? 'work');
  const [remaining, setRemaining]     = useState(DEFAULT_DURATIONS.work);
  const [total, setTotal]             = useState(DEFAULT_DURATIONS.work);
  const [running, setRunning]         = useState(false);

  // Wall-clock anchor: timestamp when the current running segment started
  const endAtRef = useRef<number>(0);

  // Interval reference for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Controls derived from timer state ───────────────────────────────────
  const timerState: TimerState = {
    sessionType,
    remainingSeconds: remaining,
    totalSeconds: total,
    status: running ? 'running' : remaining < total ? 'paused' : 'idle',
  };
  const controls: ControlsState = deriveControls(timerState);

  // ── Start / Pause ───────────────────────────────────────────────────────
  const handleStartPause = useCallback(() => {
    if (running) {
      // Pause: freeze remaining time using wall-clock snapshot
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const elapsed = total - remaining;
      endAtRef.current = 0; // no future end point while paused
      setRunning(false);
    } else {
      // Start: set end timestamp from current remaining
      endAtRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }, [running, total, remaining]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endAtRef.current = 0;
    setRunning(false);

    // Reload session duration in case it changed externally
    const dur = sessionDuration(sessionType);
    setTotal(dur);
    setRemaining(dur);
  }, [sessionType]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Skip when focus is on an input or button (per AC-5, AC-10)
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'button') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStartPause, handleReset]);

  // ── Wall-clock tick ──────────────────────────────────────────────────────
  // Uses Date.now() deltas so the countdown stays accurate when the tab is
  // backgrounded — required for AC-6 (no drift in background tab).
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remainingMs = endAtRef.current - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingSec <= 0) {
        // Session ended
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        endAtRef.current = 0;
        setRunning(false);
        setRemaining(0);
        onSessionEnd?.();
        return;
      }

      setRemaining(remainingSec);
      onTick?.(remainingSec);
    }, 250); // check every 250ms for accuracy, display snaps to seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, onTick, onSessionEnd]);

  // ── Pause state badge ────────────────────────────────────────────────────
  // Badge only visible when paused AND time has been consumed (remaining < total).
  const showPausedBadge = controls.showPausedBadge;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Controls row */}
      <div className={styles.controls} role="group" aria-label="Timer controls">
        {/* Reset button */}
        <button
          className={styles.resetBtn}
          id="resetBtn"
          aria-label="Reset timer"
          title="Reset (R)"
          onClick={handleReset}
          disabled={controls.isRunning === false && remaining === total}
        >
          {/* Reset icon (rotate-arrow) */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </button>

        {/* Start / Pause button */}
        <button
          className={`${styles.startBtn} ${controls.isRunning ? styles.isRunning : ''}`}
          id="startBtn"
          aria-pressed={controls.ariaPressed}
          aria-label={controls.startLabel === 'Start' ? 'Start timer' : 'Pause timer'}
          onClick={handleStartPause}
        >
          {/* Play icon */}
          {controls.startLabel === 'Start' && (
            <svg
              id="startIcon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 4.5 L20 12 L7 19.5 Z" />
            </svg>
          )}
          {/* Pause icon */}
          {controls.startLabel === 'Pause' && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
          <span id="startLabel">{controls.startLabel}</span>
        </button>
      </div>

      {/* Footer keyboard hint */}
      {showFooter && (
        <footer className={styles.footer}>
          <p>
            Press <kbd>Space</kbd> to start or pause,{' '}
            <kbd>R</kbd> to reset.
          </p>
        </footer>
      )}
    </>
  );
}
