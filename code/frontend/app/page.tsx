'use client';

/**
 * Page — single-page Pomodoro Timer
 *
 * Orchestrates the session cycle, daily counter, and timer controls.
 * All logic lives here so child components remain purely presentational.
 */

import { useEffect, useState } from 'react';
import type { SessionType } from '../lib/mock/start-pause-and-reset-controls';
import TimerControls from '../components/TimerControls';
import DailyCounter, { incrementDailyCount } from '../components/DailyCounter';

// ─── Session cycle helpers ───────────────────────────────────────────────────

const CYCLE_BEFORE_LONG = 4; // long break after every 4th work session

function nextSessionType(
  current: SessionType,
  completedWorkCount: number,
): SessionType {
  if (current === 'work') {
    // After 4th work session → long break; otherwise → short break.
    return (completedWorkCount + 1) % CYCLE_BEFORE_LONG === 0 ? 'long' : 'short';
  }
  // After any break → work.
  return 'work';
}

// ─── Daily counter initial value ─────────────────────────────────────────────

function initDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('pomodoro:daily');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { count: number; date: string };
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    if (parsed.date !== today) return 0;
    return parsed.count;
  } catch {
    return 0;
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [dailyCount, setDailyCount] = useState(0);

  // Initialise daily counter from localStorage on mount.
  useEffect(() => {
    setDailyCount(initDailyCount());
  }, []);

  // Called by TimerControls when the countdown reaches 0.
  function onTimerSessionEnd() {
    // Increment the counter only for a completed Work session.
    if (sessionType === 'work') {
      incrementDailyCount();
      setDailyCount((c) => c + 1);
    }
    // Advance to the next session type.
    const next = nextSessionType(sessionType, dailyCount);
    setSessionType(next);
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Daily counter chip in the top bar */}
      <div className="flex items-center gap-2 text-sm">
        <DailyCounter count={dailyCount} />
      </div>

      {/* Timer with session-type pill, progress ring, and controls */}
      <TimerControls
        sessionType={sessionType}
        onSessionEnd={onTimerSessionEnd}
      />
    </main>
  );
}
