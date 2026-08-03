/**
 * Mock data module for "Settings for the three durations" (plan item 6).
 *
 * This file is the contract the backend must satisfy.  Shape it exactly as the
 * API would return it — field names, types, nullability, and error shape.
 * When the real API exists, replace this file and nothing else.
 *
 * The settings store holds three session durations in minutes:
 *   work  — 1–120  (Work session)
 *   short — 1–60   (Short Break)
 *   long  — 1–120  (Long Break)
 */

export interface SettingsData {
  work: number;
  short: number;
  long: number;
}

export interface SettingsResponse {
  data: SettingsData;
}

export interface SettingsState {
  loading: boolean;
  error: string | null;
  data: SettingsData;
}

/** Defaults per SRS TIMER-009 §1 and the approved design. */
export const DEFAULT_SETTINGS: SettingsData = {
  work: 25,
  short: 5,
  long: 15,
};

/** Natural loading delay used by the mock to exercise the loading state. */
export const MOCK_DELAY_MS = 600;

/** Simulated network error used by the mock to exercise the error state. */
export const MOCK_ERROR = 'Unable to load settings. Please try again.';
/**
 * Mock data-access layer.  All reads and writes go through here — swapping
 * to a real API touches only this file.
 */

import type { SettingsData, SettingsState } from './settings-for-the-three-durations';
import {
  DEFAULT_SETTINGS,
  MOCK_DELAY_MS,
  MOCK_ERROR,
} from './settings-for-the-three-durations';

const STORAGE_KEY = 'pomodoro:settings';

/** Read persisted settings from localStorage.  Falls back to defaults. */
export function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return {
      work: clamp(parsed.work ?? DEFAULT_SETTINGS.work, 1, 120),
      short: clamp(parsed.short ?? DEFAULT_SETTINGS.short, 1, 60),
      long: clamp(parsed.long ?? DEFAULT_SETTINGS.long, 1, 120),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persist settings to localStorage.  Throws on failure. */
export function saveSettings(settings: SettingsData): void {
  const raw = JSON.stringify(settings);
  localStorage.setItem(STORAGE_KEY, raw);
}

/** Reset to defaults and persist. */
export function resetToDefaults(): SettingsData {
  const defaults = { ...DEFAULT_SETTINGS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

// ── Mock async API surface ────────────────────────────────────────────────────

/** Simulates a GET /settings call with a loading delay. */
export async function fetchSettings(): Promise<SettingsData> {
  await delay(MOCK_DELAY_MS);
  return loadSettings();
}

/** Simulates a PUT /settings call with a loading delay. */
export async function persistSettings(
  settings: SettingsData,
): Promise<SettingsData> {
  await delay(300);
  saveSettings(settings);
  return settings;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Story test helpers (used by test files, not production code) ─────────────

/** Seed localStorage with arbitrary settings for test scenarios. */
export function seedSettings(overrides: Partial<SettingsData>): void {
  const base = loadSettings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, ...overrides }));
}

/** Clear all persisted settings. */
export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
