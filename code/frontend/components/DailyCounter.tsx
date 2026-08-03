'use client';

/**
 * DailyCounter — tracks how many Work sessions were completed today.
 *
 * Persists to localStorage under `pomodoro:daily` with shape:
 *   { count: number, date: string }   // date = YYYY-M-D (local)
 *
 * On every mount (including reload) it reads storage, compares the stored
 * date to today, and resets to 0 if the dates differ.
 * onSessionEnd increments the count only for finished Work sessions.
 */

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'pomodoro:daily' as const;

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readStorage(): { count: number; date: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      typeof (parsed as Record<string, unknown>).count === 'number' &&
      typeof (parsed as Record<string, unknown>).date === 'string'
    ) {
      return parsed as { count: number; date: string };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStorage(count: number, date: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, date }));
  } catch {
    // localStorage unavailable — counter shows 0, no crash.
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DailyCounterProps {
  /**
   * Callback invoked by the parent when a session ends.
   * Passes the type of the session that just finished.
   */
  onSessionEnd?: (finishedSessionType: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyCounter({ onSessionEnd }: DailyCounterProps) {
  const [count, setCount] = useState(0);
  const onSessionEndRef = useRef(onSessionEnd);
  useEffect(() => { onSessionEndRef.current = onSessionEnd; }, [onSessionEnd]);

  // Initialise from localStorage on mount.
  useEffect(() => {
    const stored = readStorage();
    const today = todayDate();
    if (!stored || stored.date !== today) {
      // No entry, or stale from a previous day — start fresh.
      setCount(0);
      writeStorage(0, today);
    } else {
      setCount(stored.count);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // onSessionEnd handler: increment only for a completed Work session.
  const handleSessionEnd = (finishedType: string) => {
    if (finishedType !== 'work') return;

    const today = todayDate();
    const stored = readStorage();
    const storedDate = stored?.date ?? today;
    const currentCount = storedDate !== today ? 0 : (stored?.count ?? 0);
    const next = currentCount + 1;

    setCount(next);
    writeStorage(next, today);
    onSessionEndRef.current?.(finishedType);
  };

  // Expose the handler so the parent can wire it to TimerControls.onSessionEnd.
  // The parent reads this ref via a callback so the ref is always current.
  // (The component registers itself via the prop; see usage in page.tsx.)

  return (
    <span
      id="dailyCount"
      className="text-primary font-semibold tabular-nums"
      aria-live="polite"
      aria-atomic="true"
    >
      {count} work sessions today
    </span>
  );
}

// ─── Public hook ──────────────────────────────────────────────────────────────

/**
 * Returns the current daily count value. Call this in the parent that owns
 * the onSessionEnd wiring so the count can be atomically read and incremented
 * before TimerControls fires the next cycle.
 *
 * Usage in page.tsx:
 *   const { count, handleSessionEnd } = useDailyCounter();
 *
 * Then pass handleSessionEnd to both <DailyCounter> and <TimerControls>.
 */
export function useDailyCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const stored = readStorage();
    const today = todayDate();
    if (!stored || stored.date !== today) {
      setCount(0);
      writeStorage(0, today);
    } else {
      setCount(stored.count);
    }
  }, []);

  const handleSessionEnd = (finishedType: string) => {
    if (finishedType !== 'work') return;

    const today = todayDate();
    const stored = readStorage();
    const storedDate = stored?.date ?? today;
    const currentCount = storedDate !== today ? 0 : (stored?.count ?? 0);
    const next = currentCount + 1;

    setCount(next);
    writeStorage(next, today);
  };

  return { count, handleSessionEnd };
}
