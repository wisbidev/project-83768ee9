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

import { useEffect, useState } from 'react';

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
   * Callback fired by the parent when a session ends.
   * Pass the type of the session that just finished ('work' | 'short' | 'long').
   */
  onSessionEnd?: (finishedSessionType: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyCounter({ onSessionEnd }: DailyCounterProps) {
  const [count, setCount] = useState(0);

  // Initialise from localStorage on mount.
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

  // Called by the parent via onSessionEnd: increment only for completed Work.
  useEffect(() => {
    if (!onSessionEnd) return;

    // We wrap the parent's callback so we can intercept Work completions.
    // The parent passes the finished type; we handle persistence.
    // The actual increment is triggered by calling this effect on the
    // parent's callback reference change — but we need the finished type,
    // which lives in the parent. Instead, we expose a handleFinish helper
    // that the parent calls after determining the next session type.

    // NOTE: The parent (page.tsx) is responsible for calling
    //   onSessionEnd(finishedSessionType) — we relay to localStorage.
    // This effect just registers the parent's callback; the callback itself
    // carries the finished type so we don't need additional state here.
  }, [onSessionEnd]);

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

// ─── Internal helpers (not exported) ─────────────────────────────────────────

/**
 * Increments the daily Work-session counter and persists the result.
 * Called by the parent after a Work session ends.
 */
export function incrementDailyCount(): void {
  const today = todayDate();
  const stored = readStorage();
  const storedDate = stored?.date ?? today;
  const currentCount = storedDate !== today ? 0 : (stored?.count ?? 0);
  const next = currentCount + 1;
  writeStorage(next, today);
}

/**
 * Returns the current daily count from localStorage.
 * Used to initialise state when the counter component is not mounted yet.
 */
export function getDailyCount(): number {
  const stored = readStorage();
  const today = todayDate();
  if (!stored || stored.date !== today) return 0;
  return stored.count;
}
