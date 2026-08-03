'use client';

/**
 * Page — single-page Pomodoro Timer
 *
 * Orchestrates the session cycle, daily counter, timer controls, and (future)
 * settings.  All logic lives here in this Client Component so that child
 * components remain purely presentational.
 */

import { useState } from 'react';
import type { SessionType } from '../lib/mock/start-pause-and-reset-controls';
import TimerControls from '../components/TimerControls';
import { useDailyCounter } from '../components/DailyCounter';

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const { handleSessionEnd } = useDailyCounter();

  // Called by TimerControls when the countdown reaches 0.
  function onTimerSessionEnd() {
    const next = nextSessionType(sessionType, 0);
    setSessionType(next);
    handleSessionEnd(sessionType);
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Daily counter chip */}
      <div className="flex items-center gap-2 text-sm">
        <span id="dailyCount" aria-live="polite" aria-atomic="true">
          {/* Rendered by useDailyCounter; placeholder below during load */}
          <span className="text-primary font-semibold tabular-nums">
            {/* count injected by useDailyCounter via DOM is not possible
                without a ref; DailyCounter component is rendered separately */}
          </span>
        </span>
      </div>

      {/* Timer with session-type pill, progress ring, and controls */}
      <TimerControls
        sessionType={sessionType}
        onSessionEnd={onTimerSessionEnd}
      />
    </main>
  );
}
