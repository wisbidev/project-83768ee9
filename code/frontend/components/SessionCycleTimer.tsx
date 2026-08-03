'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SESSION_META,
  TOAST_BREAK_OVER,
  TOAST_WORK_COMPLETE_LONG,
  TOAST_WORK_COMPLETE_SHORT,
  type SessionType,
  type ToastVariant,
} from '@/lib/mock/session-cycle-with-long-break';
import SessionPill from './SessionPill';
import ProgressRing from './ProgressRing';
import CycleDots from './CycleDots';
import Toast from './Toast';
import styles from './SessionCycleTimer.module.css';

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS = { work: 25, short: 5, long: 15 };
const STORAGE_KEY = 'pomodoro:settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadDurations() {
  if (typeof window === 'undefined') return DEFAULT_DURATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_DURATIONS;
  } catch {
    return DEFAULT_DURATIONS;
  }
}

function minutesToSeconds(min: number) {
  return min * 60;
}

function nextTypeAfter(type: SessionType, cyclePosition: number): SessionType {
  if (type === 'work') {
    // After 4th work session → long break, otherwise short break
    return cyclePosition >= 3 ? 'long' : 'short';
  }
  // After any break → work
  return 'work';
}

function sessionDuration(type: SessionType, durations: { work: number; short: number; long: number }) {
  const mins =
    type === 'work'  ? durations.work
    : type === 'short' ? durations.short
    : durations.long;
  return minutesToSeconds(mins);
}

// ─── Toast state ──────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  variant: ToastVariant;
  key: number; // increment to remount Toast and restart its timer
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionCycleTimer() {
  const [type, setType]               = useState<SessionType>('work');
  const [remaining, setRemaining]     = useState(minutesToSeconds(DEFAULT_DURATIONS.work));
  const [total, setTotal]             = useState(minutesToSeconds(DEFAULT_DURATIONS.work));
  const [running, setRunning]         = useState(false);
  const [cyclePos, setCyclePos]       = useState(0); // 0-3: completed work sessions in cycle
  const [pillPulse, setPillPulse]     = useState(false);
  const [toast, setToast]             = useState<ToastState | null>(null);
  const [durations, setDurations]     = useState(DEFAULT_DURATIONS);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pillPulseRef = useRef<ReturnType<typeof setTimeout>  | null>(null);

  // ── Load durations from localStorage on mount ────────────────────────────────
  useEffect(() => {
    setDurations(loadDurations());
  }, []);

  // ── Tick ──────────────────────────────────────────────────────────────────
  const handleSessionEnd = useCallback(() => {
    // Stop the current timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);

    // Determine next type and whether this was a work session completing
    const isWorkEnd = type === 'work';
    const isFourthWork = isWorkEnd && cyclePos === 3; // position 3 = 4th session

    // Advance cycle position when a work session completes
    const nextPos: number =
      isWorkEnd && !isFourthWork  ? cyclePos + 1
      : isWorkEnd && isFourthWork  ? cyclePos      // position stays at 4 (max) during long break
      : /* break ended */           isFourthWork  ? 0           // reset after long break
      :                                   cyclePos;

    const nextType: SessionType = nextTypeAfter(type, cyclePos);

    // Set durations for the new session
    const nextDur = loadDurations();
    const nextSec = sessionDuration(nextType, nextDur);

    // Show toast
    if (isWorkEnd) {
      setToast({
        message: isFourthWork ? TOAST_WORK_COMPLETE_LONG.message : TOAST_WORK_COMPLETE_SHORT.message,
        variant: isFourthWork ? 'blue' : 'green',
        key: Date.now(),
      });
    } else {
      // Break ended
      setToast({
        message: TOAST_BREAK_OVER.message,
        variant: 'tomato',
        key: Date.now(),
      });
    }

    // Pulse the pill
    setPillPulse(true);
    if (pillPulseRef.current) clearTimeout(pillPulseRef.current);
    pillPulseRef.current = setTimeout(() => setPillPulse(false), 600);

    // Advance state — new session starts PAUSED
    setType(nextType);
    setTotal(nextSec);
    setRemaining(nextSec);
    setCyclePos(nextPos);
  }, [type, cyclePos]);

  // ── Timer tick ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          // Session ends — use callback to avoid stale closure
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // ── Watch for session end ─────────────────────────────────────────────────
  useEffect(() => {
    if (remaining === 0 && total > 0) {
      // Guard against double-fire: clear total so the effect won't re-fire
      setTotal(0);
      handleSessionEnd();
    }
  }, [remaining, total, handleSessionEnd]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const handleStartPause = useCallback(() => {
    if (running) {
      setRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setRunning(true);
    }
  }, [running]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    // Reload durations in case they changed while timer was paused
    const dur = loadDurations();
    const sec = sessionDuration(type, dur);
    setTotal(sec);
    setRemaining(sec);
  }, [type]);

  // Keyboard shortcut: Space = start/pause, R = reset
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

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

  // ── Meta ───────────────────────────────────────────────────────────────────
  const meta    = SESSION_META[type];
  const displaySec = total > 0 ? remaining : sessionDuration(type, loadDurations());

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <section
        className={styles.card}
        aria-label="Timer"
        style={{ maxWidth: 560, margin: '0 auto' }}
      >
        {/* Session type pill */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SessionPill type={type} label={meta.name} pulse={pillPulse} />
        </div>

        {/* Progress ring + countdown */}
        <ProgressRing
          type={type}
          remainingSeconds={displaySec}
          totalSeconds={sessionDuration(type, loadDurations())}
          running={running}
          hint={meta.hint}
        />

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={styles.iconBtn}
            onClick={handleReset}
            aria-label="Reset timer"
            title="Reset (R)"
          >
            {/* Reset icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>

          <button
            className={`${styles.startBtn} ${running ? styles.isRunning : ''}`}
            onClick={handleStartPause}
            aria-pressed={running}
            aria-label={running ? 'Pause timer' : 'Start timer'}
          >
            {running ? (
              /* Pause icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              /* Play icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5 L20 12 L7 19.5 Z" />
              </svg>
            )}
            <span>{running ? 'Pause' : 'Start'}</span>
          </button>
        </div>

        {/* Cycle dots */}
        <div className={styles.cycleRow}>
          <CycleDots position={cyclePos} total={4} />
        </div>
      </section>

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          variant={toast.variant}
          duration={3000}
        />
      )}
    </>
  );
}
