/**
 * DemoSessionEndTimer — "use client"
 *
 * Demonstration timer for the end-of-session sound and notification UI.
 *
 * Since stories 1–3 (timer controls, countdown display, session cycle)
 * are not yet merged, this component simulates a minimal timer so the
 * notification-status line and audio/notification integration can be
 * reviewed in the browser.
 *
 * The real timer (stories 1–3) will replace this component's behaviour
 * by dispatching the same window events this demo fires.
 *
 * Design tokens (globals.css / SRS §5):
 *   --color-primary  #E4572E  (Work pill + Start button)
 *   --color-cream    #FBF6EF  (background)
 *   --color-ink      #2B2B33  (body text, ring)
 *   --color-short    #2F9E77  (Short Break pill)
 *   --color-long     #3B6FE0  (Long Break pill)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SessionType } from '@/lib/mock/end-of-session-sound-and-notification';

type TimerState = 'idle' | 'running' | 'paused';

// Session durations in seconds (for the demo).
const DURATIONS: Record<SessionType, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const SESSION_COLORS: Record<SessionType, string> = {
  work: 'var(--color-primary)',
  short: 'var(--color-short)',
  long: 'var(--color-long)',
};

const DEMO_COUNTDOWN_SECONDS = 10; // Fast countdown for demo purposes

interface DemoSessionEndTimerProps {
  labels: Record<SessionType, string>;
}

export default function DemoSessionEndTimer({
  labels,
}: DemoSessionEndTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DEMO_COUNTDOWN_SECONDS);

  // Cycle position within the 4-session loop.
  const [cyclePos, setCyclePos] = useState(1); // 1–4

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endFiredRef = useRef(false);

  // ── Session-end logic ───────────────────────────────────────────────────────

  /** Compute the next session type from the current cycle position. */
  const computeNext = useCallback(
    (current: SessionType, pos: number): SessionType => {
      if (current === 'work') {
        // After every 4th work session → long break.
        return pos === 4 ? 'long' : 'short';
      }
      // After any break → work.
      return 'work';
    },
    []
  );

  /** Fire chime + notification, then advance the session. */
  const handleSessionEnd = useCallback(() => {
    if (endFiredRef.current) return;
    endFiredRef.current = true;

    const next = computeNext(sessionType, cyclePos);

    // Dispatch the session-end event that SessionEndNotifier listens for.
    const payload = {
      finished: sessionType,
      next,
      labels,
    };
    window.dispatchEvent(
      new CustomEvent('pomodoro:session-end', { detail: payload })
    );

    // Advance the cycle.
    setSessionType(next);
    setSecondsLeft(DURATIONS[next]);
    setCyclePos((prev) => {
      if (sessionType === 'work' && prev === 4) return 1;
      if (sessionType === 'work') return prev + 1;
      return prev;
    });
  }, [sessionType, cyclePos, labels, computeNext]);

  // ── Timer tick ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (timerState !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Session ended.
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setTimerState('idle');
          // Defer to next tick so the state update flushes first.
          setTimeout(handleSessionEnd, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, handleSessionEnd]);

  // Reset endFiredRef when a new session starts.
  useEffect(() => {
    if (timerState === 'running') {
      endFiredRef.current = false;
    }
  }, [timerState, secondsLeft]);

  // ── Controls ───────────────────────────────────────────────────────────────

  const handleStart = () => {
    // Unlock audio + request notification permission (Story 4 integration).
    window.dispatchEvent(new CustomEvent('pomodoro:unlock-audio'));
    setTimerState('running');
  };

  const handlePause = () => setTimerState('paused');
  const handleReset = () => {
    setTimerState('idle');
    setSecondsLeft(DEMO_COUNTDOWN_SECONDS);
    endFiredRef.current = false;
  };

  // ── Countdown display helpers ───────────────────────────────────────────────

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = secondsLeft / DEMO_COUNTDOWN_SECONDS;
  const ringColor = SESSION_COLORS[sessionType];
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - progress);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col items-center gap-6 rounded-2xl p-8 shadow-sm"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      {/* Session type pill */}
      <div
        className="rounded-full px-4 py-1 text-sm font-medium tracking-wide"
        style={{
          backgroundColor: ringColor,
          color: '#fff',
        }}
      >
        {labels[sessionType]}
      </div>

      {/* SVG progress ring with countdown */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg
          width={200}
          height={200}
          viewBox="0 0 200 200"
          className="-rotate-90"
          aria-label={`${mm}:${ss} remaining`}
        >
          {/* Track */}
          <circle
            cx={100}
            cy={100}
            r={90}
            fill="none"
            stroke="color-mix(in srgb, var(--color-ink) 12%, transparent)"
            strokeWidth={10}
          />
          {/* Progress arc */}
          <circle
            cx={100}
            cy={100}
            r={90}
            fill="none"
            stroke={ringColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>

        {/* Countdown text */}
        <div
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold tracking-tight"
          style={{ color: 'var(--color-ink)' }}
        >
          {mm}:{ss}
        </div>
      </div>

      {/* Cycle dots */}
      <div className="flex gap-2" role="status" aria-label="Session cycle position">
        {[1, 2, 3, 4].map((dot) => (
          <div
            key={dot}
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{
              backgroundColor:
                dot <= cyclePos && sessionType === 'work'
                  ? 'var(--color-primary)'
                  : 'color-mix(in srgb, var(--color-ink) 25%, transparent)',
            }}
          />
        ))}
      </div>

      {/* Start / Pause / Reset controls */}
      <div className="flex gap-3">
        {timerState === 'running' ? (
          <button
            onClick={handlePause}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--color-ink)',
              color: '#fff',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          >
            Start
          </button>
        )}

        <button
          onClick={handleReset}
          className="rounded-lg px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-ink) 12%, transparent)',
            color: 'var(--color-ink)',
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
        >
          Reset
        </button>
      </div>

      {/* Session-end cue preview label */}
      <p
        className="text-center text-xs leading-relaxed"
        style={{ color: 'color-mix(in srgb, var(--color-ink) 50%, transparent)' }}
      >
        When the countdown ends: a chime plays and, if you allowed notifications,
        you&apos;ll see a browser notification naming the next session.
      </p>
    </div>
  );
}
