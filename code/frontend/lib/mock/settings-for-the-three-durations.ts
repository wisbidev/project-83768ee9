/**
 * Mock data module — Settings for the three durations
 *
 * Shapes the expected state of the settings card and timer integration.
 * The real implementation replaces only this file.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SettingsValues {
  work: number;   // minutes
  short: number;  // minutes
  long: number;   // minutes
}

export type SessionType = 'work' | 'short' | 'long';

// ─── Defaults (minutes) ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: SettingsValues = {
  work:  25,
  short:  5,
  long:  15,
};

// ─── Input constraints (minutes) ─────────────────────────────────────────────

export const INPUT_CONSTRAINTS: Record<keyof SettingsValues, { min: number; max: number }> = {
  work:  { min: 1, max: 120 },
  short: { min: 1, max: 60  },
  long:  { min: 1, max: 120 },
};

// ─── localStorage key ─────────────────────────────────────────────────────────

export const STORAGE_KEY = 'pomodoro:settings';

// ─── Toast messages ───────────────────────────────────────────────────────────

export const TOAST_SAVED  = 'Settings saved — applied to the current session.';
export const TOAST_RESET = 'Defaults restored';

// ─── Mock state ───────────────────────────────────────────────────────────────

export type SettingsStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SettingsState {
  values: SettingsValues;
  status: SettingsStatus;
  errorMessage: string | null;
}

// Default / idle state
export const MOCK_IDLE_STATE: SettingsState = {
  values: DEFAULT_SETTINGS,
  status: 'idle',
  errorMessage: null,
};

// After save (Work = 50)
export const MOCK_SAVED_50_STATE: SettingsState = {
  values: { work: 50, short: 5, long: 15 },
  status: 'saved',
  errorMessage: null,
};

// After save (Work = 30, Short = 10, Long = 20)
export const MOCK_SAVED_CUSTOM_STATE: SettingsState = {
  values: { work: 30, short: 10, long: 20 },
  status: 'saved',
  errorMessage: null,
};

// Loading state
export const MOCK_LOADING_STATE: SettingsState = {
  values: { work: 0, short: 0, long: 0 },
  status: 'idle',
  errorMessage: null,
};

// Error state
export const MOCK_ERROR_STATE: SettingsState = {
  values: DEFAULT_SETTINGS,
  status: 'error',
  errorMessage: 'Could not load settings. Please refresh.',
};

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Clamp a numeric value to the valid range for each field.
 * Used both for live input and on-save validation.
 */
export function clampValue(field: keyof SettingsValues, value: number): number {
  const { min, max } = INPUT_CONSTRAINTS[field];
  if (isNaN(value)) return min;
  if (value < min)  return min;
  if (value > max)  return max;
  return Math.round(value); // whole minutes only
}

/**
 * Validate and clamp all three settings, returning the corrected values.
 * Any NaN, empty-string equivalent, or out-of-range value is clamped.
 */
export function validateSettings(raw: Partial<SettingsValues>): SettingsValues {
  return {
    work:  clampValue('work',  raw.work  ?? DEFAULT_SETTINGS.work),
    short: clampValue('short', raw.short ?? DEFAULT_SETTINGS.short),
    long:  clampValue('long',  raw.long  ?? DEFAULT_SETTINGS.long),
  };
}

/**
 * Load settings from localStorage, falling back to defaults.
 * Returns null on any parse/storage error so the caller can decide how to handle.
 */
export function loadSettings(): SettingsValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'work' in (parsed as object) &&
      'short' in (parsed as object) &&
      'long' in (parsed as object)
    ) {
      const obj = parsed as SettingsValues;
      const validated = validateSettings(obj);
      // Check if any value was out of range → fall back to defaults per TIMER-010 AC-2
      const hadOOB =
        obj.work  !== validated.work  ||
        obj.short !== validated.short ||
        obj.long  !== validated.long;
      if (hadOOB) return null; // fall back to defaults
      return validated;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save settings to localStorage. Silently swallows errors (private mode, quota).
 */
export function saveSettings(values: SettingsValues): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Swallow: TIMER-010 AC-3 — nothing should crash.
  }
}

/**
 * Reset to defaults: remove the localStorage key.
 */
export function resetToDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Swallow.
  }
}
