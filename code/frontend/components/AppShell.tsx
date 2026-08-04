'use client';

/**
 * AppShell — thin client wrapper that composes the Settings card.
 * page.tsx stays as a Server Component (the scaffold owns it).
 * This file is owned by the Settings story and collides with nothing.
 *
 * SettingsCard manages its own toast state internally; no extra wiring needed here.
 */

import SettingsCard from './SettingsCard';
import type { SettingsDurations } from '../lib/mock/settings-for-the-three-durations';

export default function AppShell() {
  // onSave / onReset are the hooks through which future story wiring restarts
  // the timer at the new duration of its own type.  The implementation here
  // is intentionally minimal — the callback interface is the contract.
  const handleSave = (_settings: SettingsDurations) => {
    // Future: notify the timer to restart at the new duration.
    // Currently a no-op so the Settings card verifies independently.
  };
  const handleReset = (_settings: SettingsDurations) => {
    // Future: same pattern as handleSave.
  };

  return <SettingsCard onSave={handleSave} onReset={handleReset} />;
}
