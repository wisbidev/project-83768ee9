'use client';

/**
 * TimerControls — Start, Pause and Reset controls with keyboard shortcuts
 *
 * Drives the countdown using wall-clock timestamps (Date.now()), so the
 * timer stays accurate even when the tab is in the background.
 *
 * The countdown counts down only while running.
 * Reset restores the current session to its full duration and leaves it paused.
 * The session type is never changed by these controls.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deriveControls,
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
   * Changes externally (e.g. session cycle advances) trigger an auto-reset.
   */
  sessionType?: SessionType;
  /**
   * Whether to show the keyboard shortcut footer hint.
   * @default true
   */
  showFooter?: boolean;
  /**
   * Callback fired approximately every 250ms with the current remaining seconds.
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
    type === 'work'   ? DEFAULT_DURATIONS.work
    : type === 'short' ? DEFAULT_DURATIONS.short
    :                    DEFAULT_DURATIONS.long
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimerControls({
  sessionType: externalType,
  showFooter = true,
  onTick,
  onSessionEnd,
}: TimerControlsProps) {
  const effectiveType = externalType ?? 'work';

  // ── Timer state ──────────────────────────────────────────────────────────
  const [remaining, setRemaining] = useState(() => sessionDuration(effectiveType));
  const [total, setTotal]         = useState(() => sessionDuration(effectiveType));
  const [running, setRunning]     = useState(false);

  // Wall-clock anchor: unix timestamp (ms) when the running segment ends.
  // 0 means "no active end point" (paused or idle).
  const endAtRef = useRef<number>(0);

  // Stable refs for callbacks so the interval callback is never stale.
  const onTickRef        = useRef(onTick);
  const onSessionEndRef  = useRef(onSessionEnd);
  useEffect(() => { onTickRef.current       = onTick;       }, [onTick]);
  useEffect(() => { onSessionEndRef.current  = onSessionEnd; }, [onSessionEnd]);

  // Interval reference for cleanup.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived state ─────────────────────────────────────────────────────────
  const timerState: TimerState = {
    sessionType: effectiveType,
    remainingSeconds: remaining,
    totalSeconds: total,
    status: running ? 'running' : remaining < total ? 'paused' : 'idle',
  };
  const controls: ControlsState = deriveControls(timerState);

  // ── Start / Pause ───────────────────────────────────────────────────────
  const handleStartPause = useCallback(() => {
    if (running) {
      // Pause: clear the interval and forget the end timestamp.
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      endAtRef.current = 0;
      setRunning(false);
    } else {
      // Start: anchor the end timestamp to wall-clock time + remaining.
      endAtRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }, [running, remaining]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endAtRef.current = 0;
    setRunning(false);
    const dur = sessionDuration(effectiveType);
    setTotal(dur);
    setRemaining(dur);
  }, [effectiveType]);

  // ── Auto-reset when session type changes externally ────────────────────
  useEffect(() => {
    // Reset whenever the parent tells us the session type changed.
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalType]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  // Space = start/pause, R = reset. Skipped when an input has focus (AC-5, AC-10).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if ((e.target as HTMLElement).closest('button')) return;

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
  // backgrounded — required for AC-6 (no drift when tab is hidden).
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      const now          = Date.now();
      const remainingMs  = endAtRef.current - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingSec <= 0) {
        // Session ended — stop and notify parent.
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        endAtRef.current = 0;
        setRunning(false);
        setRemaining(0);
        onSessionEndRef.current?.();
        return;
      }

      setRemaining(remainingSec);
      onTickRef.current?.(remainingSec);
    }, 250); // check every 250 ms; display snaps to whole seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]); // intentionally stable: running toggles start/stop only

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.controls} role="group" aria-label="Timer controls">
        {/* Reset icon button */}
        <button
          className={styles.resetBtn}
          id="resetBtn"
          aria-label="Reset timer"
          title="Reset (R)"
          onClick={handleReset}
          disabled={!running && remaining === total}
        >
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

        {/* Start / Pause primary button */}
        <button
          className={`${styles.startBtn} ${controls.isRunning ? styles.isRunning : ''}`}
          id="startBtn"
          aria-pressed={controls.ariaPressed}
          aria-label={controls.startLabel === 'Start' ? 'Start timer' : 'Pause timer'}
          onClick={handleStartPause}
        >
          {controls.startLabel === 'Start' ? (
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
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6"  y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
          <span id="startLabel">{controls.startLabel}</span>
        </button>
      </div>

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
