'use client';

/**
 * SettingsCard — change Work, Short Break and Long Break durations.
 *
 * Reads saved settings from localStorage on mount (falling back to defaults).
 * Save and Reset both:
 *   1. validate + clamp the three values
 *   2. write to localStorage
 *   3. fire onSave / onReset with the new durations
 *   4. show a toast confirming the action
 *
 * Pressing Enter inside any duration input saves (same as the Save button).
 *
 * All localStorage reads/writes are wrapped in try/catch so the app never
 * crashes, even in private browsing or when quota is exceeded.
 */

import { useCallback, useEffect, useState } from 'react';
import Toast from './Toast';
import styles from './SettingsCard.module.css';
import {
  DEFAULT_SETTINGS,
  INPUT_BOUNDS,
  STORAGE_KEY,
  TOAST_RESET,
  TOAST_SAVED,
  clamp,
  loadFromStorage,
  saveToStorage,
  type SettingsDurations,
} from '../lib/mock/settings-for-the-three-durations';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface SettingsCardProps {
  /**
   * Callback fired when settings are saved (or reset).
   * Parent uses this to restart the timer at the new duration of its own type.
   */
  onSave?: (settings: SettingsDurations) => void;
  /**
   * Callback fired when Reset to defaults is pressed.
   * Equivalent to saving the default values.
   */
  onReset?: (settings: SettingsDurations) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsCard({
  onSave,
  onReset,
}: SettingsCardProps) {
  // ── Form field state (minutes, whole numbers) ─────────────────────────────
  const [workVal,  setWorkVal]  = useState(DEFAULT_SETTINGS.work);
  const [shortVal, setShortVal] = useState(DEFAULT_SETTINGS.short);
  const [longVal,  setLongVal]  = useState(DEFAULT_SETTINGS.long);

  // ── Loading state — shown while reading from localStorage on mount ───────
  const [loading, setLoading] = useState(true);

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toastMsg,    setToastMsg]    = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // ── Saving state — disables the save button while processing ────────────
  const [saving, setSaving] = useState(false);

  // ── Load settings from localStorage on mount ──────────────────────────────
  useEffect(() => {
    try {
      const saved = loadFromStorage();
      setWorkVal(saved.work);
      setShortVal(saved.short);
      setLongVal(saved.long);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show toast ───────────────────────────────────────────────────────────
  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    setToastVisible(true);
  }, []);

  // ── Handle save ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (saving) return;

    // 1. Parse raw values (treat empty/non-numeric as 0 → will be clamped)
    const rawWork  = parseFloat(String(workVal));
    const rawShort = parseFloat(String(shortVal));
    const rawLong  = parseFloat(String(longVal));

    const work  = clamp(Number.isNaN(rawWork)  ? 0 : rawWork,  INPUT_BOUNDS.work.min,  INPUT_BOUNDS.work.max);
    const short = clamp(Number.isNaN(rawShort) ? 0 : rawShort, INPUT_BOUNDS.short.min, INPUT_BOUNDS.short.max);
    const long  = clamp(Number.isNaN(rawLong)  ? 0 : rawLong,  INPUT_BOUNDS.long.min,  INPUT_BOUNDS.long.max);

    // 2. Update UI to clamped values
    setWorkVal(work);
    setShortVal(short);
    setLongVal(long);

    // 3. Persist
    const settings: SettingsDurations = { work, short, long };
    saveToStorage(settings); // try/catch inside; failures do not crash

    // 4. Notify parent (restart timer)
    setSaving(true);
    try {
      onSave?.(settings);
    } finally {
      setSaving(false);
    }

    // 5. Confirm
    showToast(TOAST_SAVED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workVal, shortVal, longVal, saving, onSave, showToast]);

  // ── Handle reset to defaults ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (saving) return;

    const settings: SettingsDurations = { ...DEFAULT_SETTINGS };

    // Update UI
    setWorkVal(settings.work);
    setShortVal(settings.short);
    setLongVal(settings.long);

    // Persist
    saveToStorage(settings);

    // Notify parent
    setSaving(true);
    try {
      onReset?.(settings);
    } finally {
      setSaving(false);
    }

    showToast(TOAST_RESET);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, onReset, showToast]);

  // ── Enter key inside an input triggers save ───────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
  );

  // ── Toast dismiss ─────────────────────────────────────────────────────────
  const handleToastDismiss = useCallback(() => {
    setToastVisible(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <section
        className={`${styles.card} ${loading ? styles.loading : ''}`}
        id="settings"
        aria-label="Settings"
      >
        {/* Heading */}
        <h2 className={styles.heading}>
          {/* Gear icon */}
          <svg
            className={styles.headingIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
        <p className={styles.subtitle}>
          Durations are saved in this browser and applied to the current and next sessions.
        </p>

        {/* Field grid */}
        <div className={styles.fieldGrid}>
          {/* Work */}
          <div className={styles.field}>
            <label htmlFor="inpWork">Work</label>
            <div className={styles.inputWrap}>
              <input
                id="inpWork"
                type="number"
                className={styles.numberInput}
                value={workVal}
                min={INPUT_BOUNDS.work.min}
                max={INPUT_BOUNDS.work.max}
                inputMode="numeric"
                aria-label="Work duration in minutes"
                onChange={(e) => setWorkVal(Number(e.target.value))}
                onKeyDown={handleKeyDown}
              />
              <span className={styles.unit} aria-hidden="true">min</span>
            </div>
          </div>

          {/* Short break */}
          <div className={styles.field}>
            <label htmlFor="inpShort">Short break</label>
            <div className={styles.inputWrap}>
              <input
                id="inpShort"
                type="number"
                className={styles.numberInput}
                value={shortVal}
                min={INPUT_BOUNDS.short.min}
                max={INPUT_BOUNDS.short.max}
                inputMode="numeric"
                aria-label="Short break duration in minutes"
                onChange={(e) => setShortVal(Number(e.target.value))}
                onKeyDown={handleKeyDown}
              />
              <span className={styles.unit} aria-hidden="true">min</span>
            </div>
          </div>

          {/* Long break */}
          <div className={styles.field}>
            <label htmlFor="inpLong">Long break</label>
            <div className={styles.inputWrap}>
              <input
                id="inpLong"
                type="number"
                className={styles.numberInput}
                value={longVal}
                min={INPUT_BOUNDS.long.min}
                max={INPUT_BOUNDS.long.max}
                inputMode="numeric"
                aria-label="Long break duration in minutes"
                onChange={(e) => setLongVal(Number(e.target.value))}
                onKeyDown={handleKeyDown}
              />
              <span className={styles.unit} aria-hidden="true">min</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghostBtn}
            id="defaultsBtn"
            onClick={handleReset}
            disabled={saving}
            aria-label="Reset all durations to defaults"
          >
            Reset to defaults
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            id="saveBtn"
            onClick={handleSave}
            disabled={saving}
            aria-label="Save settings"
          >
            Save settings
          </button>
        </div>
      </section>

      {/* Toast notification */}
      <Toast
        message={toastMsg}
        visible={toastVisible}
        variant="ink"
        duration={3000}
        onDismiss={handleToastDismiss}
      />
    </>
  );
}
