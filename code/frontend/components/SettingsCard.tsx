'use client';

/**
 * SettingsCard — Duration settings card
 *
 * Allows the user to change Work / Short Break / Long Break durations.
 * Saves to and loads from localStorage (`pomodoro:settings`).
 *
 * When settings change, the timer is stopped and restarted at the new duration
 * of the current session type. This is done via the `onSettingsChange` callback.
 *
 * Pressing Enter inside any input saves, same as the Save button.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  INPUT_CONSTRAINTS,
  TOAST_RESET,
  TOAST_SAVED,
  type SettingsValues,
  clampValue,
  loadSettings,
  resetToDefaults,
  saveSettings,
  validateSettings,
} from '../lib/mock/settings-for-the-three-durations';
import { showToast } from './Toast';
import styles from './SettingsCard.module.css';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface SettingsCardProps {
  /**
   * The current session type — used to restart the timer at the new duration.
   */
  currentSessionType?: 'work' | 'short' | 'long';
  /**
   * Called when settings change (save or reset).
   * Receives the new duration value in minutes for the current session type.
   * The parent should stop the running timer and restart it at this duration.
   */
  onSettingsChange?: (newMinutes: number) => void;
  /**
   * Whether the controls (save/reset) should be disabled.
   * Useful when the parent timer is loading.
   */
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsCard({
  currentSessionType = 'work',
  onSettingsChange,
  disabled = false,
}: SettingsCardProps) {
  // Form input values (minutes, live-clamped as user types)
  const [work,  setWork]  = useState<number>(DEFAULT_SETTINGS.work);
  const [short, setShort] = useState<number>(DEFAULT_SETTINGS.short);
  const [long,  setLong]  = useState<number>(DEFAULT_SETTINGS.long);

  // Loading state — true while reading localStorage on mount
  const [loading, setLoading] = useState(true);

  // Saving state — briefly true while persisting
  const [saving, setSaving] = useState(false);

  // Error message for UI feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stable onSettingsChange ref so callbacks never go stale
  const onSettingsChangeRef = useRef(onSettingsChange);
  useEffect(() => { onSettingsChangeRef.current = onSettingsChange; }, [onSettingsChange]);

  // ── Load settings on mount ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = loadSettings();
      if (saved) {
        setWork(saved.work);
        setShort(saved.short);
        setLong(saved.long);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (disabled || saving) return;

    // Validate + clamp all fields
    const raw: Partial<SettingsValues> = { work, short, long };
    const validated = validateSettings(raw);

    // Sync UI to clamped values
    setWork(validated.work);
    setShort(validated.short);
    setLong(validated.long);

    setSaving(true);
    setErrorMsg(null);

    // Persist to localStorage (silently swallows errors)
    saveSettings(validated);

    // Notify parent to restart timer at new duration for current session type
    const newDuration =
      currentSessionType === 'work'   ? validated.work
      : currentSessionType === 'short' ? validated.short
      :                                    validated.long;

    setSaving(false);
    onSettingsChangeRef.current?.(newDuration);

    showToast(TOAST_SAVED, 'ink');
  }, [disabled, saving, work, short, long, currentSessionType]);

  // ── Reset to defaults ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (disabled || saving) return;

    setSaving(true);
    setErrorMsg(null);

    resetToDefaults();

    const def = DEFAULT_SETTINGS;
    setWork(def.work);
    setShort(def.short);
    setLong(def.long);

    const newDuration =
      currentSessionType === 'work'   ? def.work
      : currentSessionType === 'short' ? def.short
      :                                    def.long;

    setSaving(false);
    onSettingsChangeRef.current?.(newDuration);

    showToast(TOAST_RESET, 'ink');
  }, [disabled, saving, currentSessionType]);

  // ── Enter key inside input → save ────────────────────────────────────────
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  // ── Live clamping on input change (preview only, not persisted) ────────────
  const handleWorkChange  = (v: string) => setWork(clampValue('work',  Number(v)));
  const handleShortChange = (v: string) => setShort(clampValue('short', Number(v)));
  const handleLongChange  = (v: string) => setLong(clampValue('long',  Number(v)));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className={styles.card}
      aria-label="Settings"
      aria-busy={loading || saving}
    >
      {/* Heading */}
      <h2 className={styles.heading}>
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
      <div className={styles.fieldGrid} role="group" aria-label="Session durations">
        {/* Work */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="inpWork">
            Work
          </label>
          <div className={styles.inputWrap}>
            <input
              id="inpWork"
              type="number"
              className={styles.input}
              value={loading ? '' : work}
              min={INPUT_CONSTRAINTS.work.min}
              max={INPUT_CONSTRAINTS.work.max}
              inputMode="numeric"
              aria-label="Work duration in minutes"
              disabled={disabled || saving || loading}
              onChange={e => handleWorkChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <span className={styles.unit} aria-hidden="true">min</span>
          </div>
        </div>

        {/* Short break */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="inpShort">
            Short break
          </label>
          <div className={styles.inputWrap}>
            <input
              id="inpShort"
              type="number"
              className={styles.input}
              value={loading ? '' : short}
              min={INPUT_CONSTRAINTS.short.min}
              max={INPUT_CONSTRAINTS.short.max}
              inputMode="numeric"
              aria-label="Short break duration in minutes"
              disabled={disabled || saving || loading}
              onChange={e => handleShortChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <span className={styles.unit} aria-hidden="true">min</span>
          </div>
        </div>

        {/* Long break */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="inpLong">
            Long break
          </label>
          <div className={styles.inputWrap}>
            <input
              id="inpLong"
              type="number"
              className={styles.input}
              value={loading ? '' : long}
              min={INPUT_CONSTRAINTS.long.min}
              max={INPUT_CONSTRAINTS.long.max}
              inputMode="numeric"
              aria-label="Long break duration in minutes"
              disabled={disabled || saving || loading}
              onChange={e => handleLongChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
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
          disabled={disabled || saving || loading}
          onClick={handleReset}
        >
          Reset to defaults
        </button>

        <button
          type="button"
          className={styles.primaryBtn}
          id="saveBtn"
          disabled={disabled || saving || loading}
          onClick={handleSave}
        >
          {saving && <span className={styles.spinner} aria-hidden="true" />}
          Save settings
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className={styles.errorMsg} role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMsg}
        </p>
      )}
    </section>
  );
}
