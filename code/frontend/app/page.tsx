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

// ─── Session cycle ────────────────────────────────────────────────────────────

const CYCLE_BEFORE_LONG = 4; // long break after every 4th work session

function nextSessionType(
  current: SessionType,
  completedWorkCount: number,
): SessionType {
  if (current !== 'work') {
    // After any break → Work; cycle position resets to 0 for the new cycle.
    return 'work';
  }
  // After a Work session: long break if this was the 4th in the cycle.
  return completedWorkCount % CYCLE_BEFORE_LONG === 0 ? 'long' : 'short';
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
  // Number of completed work sessions in the current cycle (0–3 before long break).
  // Resets to 0 after every Long Break.
  const [cycleCompletedWork, setCycleCompletedWork] = useState(0);

  // Initialise daily counter from localStorage on mount.
  useEffect(() => {
    setDailyCount(initDailyCount());
  }, []);

  // Called by TimerControls when the countdown reaches 0.
  function onTimerSessionEnd() {
    if (sessionType === 'work') {
      // Increment the daily counter and persist to localStorage.
      incrementDailyCount();
      setDailyCount((c) => c + 1);
      // Advance the cycle counter; long break fires when this was session 4.
      setCycleCompletedWork((n) => n + 1);
    } else {
      // After any break, cycle position resets.
      setCycleCompletedWork(0);
    }
    // Advance to the next session type.
    setSessionType((prev) => nextSessionType(prev, cycleCompletedWork));
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
