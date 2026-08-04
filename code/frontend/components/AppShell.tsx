'use client';

/**
 * AppShell — thin client wrapper that composes the Settings card and Toast.
 * page.tsx stays as a Server Component (the scaffold owns it).
 * This file is owned by the Settings story and collides with nothing.
 */

import { useCallback, useState } from 'react';
import SettingsCard from './SettingsCard';
import Toast, { type ToastVariant } from './Toast';
import type { SettingsDurations } from '../lib/mock/settings-for-the-three-durations';

export default function AppShell() {
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<ToastVariant>('ink');

  const showToast = useCallback((message: string, variant: ToastVariant = 'ink') => {
    setToastMsg(message);
    setToastVariant(variant);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleSave = useCallback((settings: SettingsDurations) => {
    // The SettingsCard has already persisted to localStorage.
    // Here the parent would restart the timer at the new duration of its own type.
    // For now this story provides the event hook so future wiring is a one-line change.
    // eslint-disable-next-line no-console
    console.info('[AppShell] settings saved, onSave called with', settings);
  }, []);

  const handleReset = useCallback((settings: SettingsDurations) => {
    // eslint-disable-next-line no-console
    console.info('[AppShell] settings reset, onReset called with', settings);
  }, []);

  return (
    <>
      <SettingsCard onSave={handleSave} onReset={handleReset} />
      <Toast
        message={toastMsg}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={dismissToast}
      />
    </>
  );
}
