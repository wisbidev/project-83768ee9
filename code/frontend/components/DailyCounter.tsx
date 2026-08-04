'use client';

/**
 * DailyCounter — tracks how many Work sessions were completed today.
 *
 * Persists to localStorage under `pomodoro:daily` with shape:
 *   { count: number, date: string }   // date = YYYY-M-D (local)
 *
 * On mount it reads storage, compares the stored date to today, and resets
 * to 0 if the dates differ.
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

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Increments the daily Work-session counter and persists the result.
 * Returns the new count so callers can update state without stale reads.
 * Call this after a Work session ends.
 */
export function incrementDailyCount(): number {
  const today = todayDate();
  const stored = readStorage();
  const storedDate = stored?.date ?? today;
  const currentCount = storedDate !== today ? 0 : (stored?.count ?? 0);
  const next = currentCount + 1;
  writeStorage(next, today);
  return next;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DailyCounterProps {
  /** Current count value — owned by the parent (page.tsx). */
  count: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyCounter({ count }: DailyCounterProps) {
  // Initialise storage on mount.
  useEffect(() => {
    const stored = readStorage();
    const today = todayDate();
    if (!stored || stored.date !== today) {
      writeStorage(0, today);
    }
  }, []);

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
