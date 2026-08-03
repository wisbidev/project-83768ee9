'use client';

/**
 * Settings card — "Settings for the three durations" (plan item 6).
 *
 * All values come from design tokens defined in `design/design-system.md`.
 * The three inputs let the user change Work / Short Break / Long Break durations.
 * Saving or resetting restarts the current session at the new duration of its
 * own type and persists the values under `pomodoro:settings` in localStorage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SETTINGS } from '../lib/mock/settings-for-the-three-durations';
import type { SettingsData } from '../lib/mock/settings-for-the-three-durations';
import { showToast } from './Toast';

// ── Validation constants ──────────────────────────────────────────────────────

const LIMITS = {
  work:  { min: 1,  max: 120 },
  short: { min: 1,  max: 60  },
  long:  { min: 1,  max: 120 },
} as const;

type SessionKey = keyof SettingsData;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ── Settings restart event ────────────────────────────────────────────────────
// The timer listens for this event and restarts the current session at the new
// duration.  The event carries the session type so the timer knows which field
// changed.

export interface SessionRestartEvent {
  type: 'work' | 'short' | 'long';
  minutes: number;
}

export function dispatchSessionRestart(data: SessionRestartEvent): void {
  document.dispatchEvent(
    new CustomEvent<SessionRestartEvent>('settings:restart-session', {
      detail: data,
    }),
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsCard() {
  const [values, setValues] = useState<SettingsData>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Record<SessionKey, HTMLInputElement | null>>({
    work: null,
    short: null,
    long: null,
  });

  // ── Load settings on mount ─────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Dynamic import avoids server-side localStorage access.
        const { loadSettings } = await import(
          '../lib/mock/settings-for-the-three-durations'
        );
        setValues(loadSettings());
      } catch {
        setError('Unable to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Input change ───────────────────────────────────────────────────────────

  function handleChange(key: SessionKey, raw: string) {
    const num = parseInt(raw, 10);
    setValues((prev) => ({
      ...prev,
      [key]: isNaN(num) ? prev[key] : num,
    }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (currentType: SessionKey = 'work') => {
      setSaving(true);
      try {
        // Clamp all three values to their valid ranges.
        const clamped: SettingsData = {
          work: clamp(values.work, LIMITS.work.min, LIMITS.work.max),
          short: clamp(values.short, LIMITS.short.min, LIMITS.short.max),
          long: clamp(values.long, LIMITS.long.min, LIMITS.long.max),
        };

        // Persist to localStorage.
        const { saveSettings } = await import(
          '../lib/mock/settings-for-the-three-durations'
        );
        saveSettings(clamped);

        // Update local state with clamped values (so inputs reflect clamped
        // values after save).
        setValues(clamped);

        // Sync input display values to clamped values.
        (inputRefs.current.work  as HTMLInputElement).value = String(clamped.work);
        (inputRefs.current.short as HTMLInputElement).value = String(clamped.short);
        (inputRefs.current.long  as HTMLInputElement).value = String(clamped.long);

        // Restart the current session at the new duration of its own type.
        dispatchSessionRestart({
          type: currentType,
          minutes: clamped[currentType],
        });

        showToast('Settings saved — applied to the current session.', 'ink');
      } catch {
        showToast('Unable to save settings. Please try again.', 'tomato');
      } finally {
        setSaving(false);
      }
    },
    [values],
  );

  // ── Reset to defaults ───────────────────────────────────────────────────────

  async function handleReset(currentType: SessionKey = 'work') {
    setSaving(true);
    try {
      const { resetToDefaults } = await import(
        '../lib/mock/settings-for-the-three-durations'
      );
      const defaults = resetToDefaults();
      setValues(defaults);

      (inputRefs.current.work  as HTMLInputElement).value = String(defaults.work);
      (inputRefs.current.short as HTMLInputElement).value = String(defaults.short);
      (inputRefs.current.long  as HTMLInputElement).value = String(defaults.long);

      dispatchSessionRestart({ type: currentType, minutes: defaults[currentType] });

      showToast('Defaults restored', 'ink');
    } catch {
      showToast('Unable to reset. Please try again.', 'tomato');
    } finally {
      setSaving(false);
    }
  }

  // ── Enter key ───────────────────────────────────────────────────────────────

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    currentType: SessionKey,
  ) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSave(currentType);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section
      className="bg-white border border-[#EFE6DC] rounded-[24px] shadow-[0_18px_50px_-18px_rgba(228,87,46,0.25)] p-7"
      id="settings"
      aria-label="Settings"
    >
      {/* Heading */}
      <h2 className="text-[17px] font-extrabold tracking-tight flex items-center gap-2 text-ink">
        {/* Gear icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9C918A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
        </svg>
        Settings
      </h2>

      {/* Subtitle */}
      <p className="text-[13px] text-[#9C918A] mt-1">
        Durations are saved in this browser and applied to the current and next
        sessions.
      </p>

      {/* Loading state */}
      {loading && (
        <div
          className="mt-5 flex items-center justify-center gap-2 text-[13px] text-[#9C918A] py-8"
          aria-live="polite"
          aria-label="Loading settings"
        >
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.2-8.5" />
          </svg>
          Loading settings…
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className="mt-5 rounded-xl bg-[#FCE4D8] text-primary text-[13px] font-semibold px-4 py-3"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Settings form */}
      {!loading && !error && (
        <>
          {/* Field grid — 3 columns on wide, 1 column on narrow (≤480px) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            {/* Work */}
            <div className="field">
              <label
                htmlFor="inpWork"
                className="block text-[12px] font-bold text-[#9C918A] mb-1.5 tracking-wide"
              >
                Work
              </label>
              <div
                className="flex items-center gap-2 bg-cream border border-[#EFE6DC]
                            rounded-xl px-3 py-2.5
                            focus-within:border-primary focus-within:bg-white
                            transition-colors duration-200"
              >
                <input
                  id="inpWork"
                  ref={(el) => { inputRefs.current.work = el; }}
                  type="number"
                  min={LIMITS.work.min}
                  max={LIMITS.work.max}
                  inputMode="numeric"
                  defaultValue={values.work}
                  disabled={saving}
                  onChange={(e) => handleChange('work', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'work')}
                  className="w-full bg-transparent text-[17px] font-extrabold
                             text-ink font-variant-numeric outline-none
                             disabled:opacity-50"
                  aria-label="Work session duration in minutes"
                />
                <span className="text-[13px] font-bold text-[#9C918A] shrink-0">
                  min
                </span>
              </div>
            </div>

            {/* Short break */}
            <div className="field">
              <label
                htmlFor="inpShort"
                className="block text-[12px] font-bold text-[#9C918A] mb-1.5 tracking-wide"
              >
                Short break
              </label>
              <div
                className="flex items-center gap-2 bg-cream border border-[#EFE6DC]
                            rounded-xl px-3 py-2.5
                            focus-within:border-primary focus-within:bg-white
                            transition-colors duration-200"
              >
                <input
                  id="inpShort"
                  ref={(el) => { inputRefs.current.short = el; }}
                  type="number"
                  min={LIMITS.short.min}
                  max={LIMITS.short.max}
                  inputMode="numeric"
                  defaultValue={values.short}
                  disabled={saving}
                  onChange={(e) => handleChange('short', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'short')}
                  className="w-full bg-transparent text-[17px] font-extrabold
                             text-ink font-variant-numeric outline-none
                             disabled:opacity-50"
                  aria-label="Short break duration in minutes"
                />
                <span className="text-[13px] font-bold text-[#9C918A] shrink-0">
                  min
                </span>
              </div>
            </div>

            {/* Long break */}
            <div className="field">
              <label
                htmlFor="inpLong"
                className="block text-[12px] font-bold text-[#9C918A] mb-1.5 tracking-wide"
              >
                Long break
              </label>
              <div
                className="flex items-center gap-2 bg-cream border border-[#EFE6DC]
                            rounded-xl px-3 py-2.5
                            focus-within:border-primary focus-within:bg-white
                            transition-colors duration-200"
              >
                <input
                  id="inpLong"
                  ref={(el) => { inputRefs.current.long = el; }}
                  type="number"
                  min={LIMITS.long.min}
                  max={LIMITS.long.max}
                  inputMode="numeric"
                  defaultValue={values.long}
                  disabled={saving}
                  onChange={(e) => handleChange('long', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'long')}
                  className="w-full bg-transparent text-[17px] font-extrabold
                             text-ink font-variant-numeric outline-none
                             disabled:opacity-50"
                  aria-label="Long break duration in minutes"
                />
                <span className="text-[13px] font-bold text-[#9C918A] shrink-0">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
            {/* Reset to defaults — ghost / underlined */}
            <button
              type="button"
              id="defaultsBtn"
              disabled={saving}
              onClick={() => void handleReset('work')}
              className="bg-transparent border-none text-[13px] font-bold
                         text-[#9C918A] underline underline-offset-2
                         hover:text-primary transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         py-1 px-0"
            >
              Reset to defaults
            </button>

            {/* Save settings — primary ink button */}
            <button
              type="button"
              id="saveBtn"
              disabled={saving}
              onClick={() => void handleSave('work')}
              className="bg-ink text-white border-none rounded-xl
                         px-6 py-3 text-[14px] font-extrabold
                         hover:bg-primary hover:-translate-y-px
                         active:scale-[0.98]
                         transition-all duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:translate-y-0"
            >
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
