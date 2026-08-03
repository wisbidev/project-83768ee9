/**
 * Mock data — Settings for the three durations
 *
 * Shapes the expected state returned by the "get settings" API call.
 * The real implementation replaces only this file.
 * All mock data lives here — no scattering through components.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SettingsDurations {
  work: number;   // whole minutes, 1–120
  short: number;  // whole minutes, 1–60
  long: number;   // whole minutes, 1–120
}

export interface SettingsState {
  work: number;
  short: number;
  long: number;
}

export type SettingsStatus = 'idle' | 'saving' | 'saved' | 'reset' | 'error';

// ─── Default values ──────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: SettingsDurations = {
  work:  25,
  short:  5,
  long:  15,
};

// ─── Input validation bounds ──────────────────────────────────────────────────

export const INPUT_BOUNDS = {
  work:  { min: 1,  max: 120 },
  short: { min: 1,  max: 60  },
  long:  { min: 1,  max: 120 },
} as const;

// ─── Clamp helper ─────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ─── Mock idle state ──────────────────────────────────────────────────────────

/**
 * Default settings state — the "idle" state before any user action.
 */
export const MOCK_IDLE_SETTINGS: SettingsState = {
  work:  DEFAULT_SETTINGS.work,
  short: DEFAULT_SETTINGS.short,
  long:  DEFAULT_SETTINGS.long,
};

// ─── Mock saving state ────────────────────────────────────────────────────────

/**
 * Momentary "saving" state while settings are being written.
 */
export const MOCK_SAVING_SETTINGS: SettingsState = {
  work:  50,
  short: 10,
  long:  20,
};

// ─── Mock saved state ─────────────────────────────────────────────────────────

/**
 * Settings after a successful save with custom values.
 */
export const MOCK_SAVED_SETTINGS: SettingsState = {
  work:  50,
  short: 10,
  long:  20,
};

// ─── Mock reset state ─────────────────────────────────────────────────────────

/**
 * Settings restored to defaults after "Reset to defaults".
 */
export const MOCK_RESET_SETTINGS: SettingsState = {
  work:  DEFAULT_SETTINGS.work,
  short: DEFAULT_SETTINGS.short,
  long:  DEFAULT_SETTINGS.long,
};

// ─── Mock error state ─────────────────────────────────────────────────────────

export interface SettingsErrorState {
  error: true;
  message: string;
}

export const MOCK_ERROR_SETTINGS: SettingsErrorState = {
  error: true,
  message: 'Could not load settings. Using defaults.',
};

// ─── Toast messages ──────────────────────────────────────────────────────────

export const TOAST_SAVED  = 'Settings saved — applied to the current session.';
export const TOAST_RESET  = 'Defaults restored.';

// ─── Storage key ──────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'pomodoro:settings';

// ─── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Reads settings from localStorage, falling back to defaults on any failure.
 * Invalid, missing, or out-of-range values fall back to defaults.
 */
export function loadFromStorage(): SettingsDurations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SettingsDurations>;
    return validateAndClamp(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Writes settings to localStorage.
 * Returns true on success, false on failure (private mode, quota exceeded, etc.).
 */
export function saveToStorage(settings: SettingsDurations): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and clamps the three duration values.
 * Non-numeric, empty, or out-of-range values are clamped to nearest bound.
 */
export function validateAndClamp(
  raw: Partial<SettingsDurations>,
): SettingsDurations {
  const work  = clamp(raw.work  ?? DEFAULT_SETTINGS.work,  INPUT_BOUNDS.work.min,  INPUT_BOUNDS.work.max);
  const short = clamp(raw.short ?? DEFAULT_SETTINGS.short, INPUT_BOUNDS.short.min, INPUT_BOUNDS.short.max);
  const long  = clamp(raw.long  ?? DEFAULT_SETTINGS.long,  INPUT_BOUNDS.long.min,  INPUT_BOUNDS.long.max);
  return { work, short, long };
}
