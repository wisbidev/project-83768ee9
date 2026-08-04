/**
 * SessionEndNotifier — "use client"
 *
 * Handles the two end-of-session cues for story 4:
 *   1. Audible three-tone chime (AudioContext, unlocked on first user gesture)
 *   2. Browser notification (permission requested on first Start press)
 *
 * Integration contract (setSessionEndCallback):
 *   Called by the timer/session-cycle logic (story 3) when any session reaches 0.
 *   The callback receives the finished session type and the computed next type.
 *
 * Design tokens used (from globals.css / SRS §5):
 *   --color-primary  #E4572E
 *   --color-cream    #FBF6EF
 *   --color-ink      #2B2B33
 *   --color-short    #2F9E77
 *   --color-long     #3B6FE0
 */

'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { SessionType } from '@/lib/mock/end-of-session-sound-and-notification';

export interface SessionEndPayload {
  finished: SessionType;
  next: SessionType;
  labels: Record<SessionType, string>;
}

type OnSessionEnd = (payload: SessionEndPayload) => void;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true when the Notification API is available. */
function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Returns the current Notification permission string or 'unsupported'. */
function getNotificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission as NotificationPermission;
}

type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/** Returns true when the AudioContext API is available. */
function audioContextSupported(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window;
}

// ── Three-tone chime ──────────────────────────────────────────────────────────

/**
 * Plays a short three-tone chime using the Web Audio API.
 * Each tone is a sine wave at a pleasant frequency (C5, E5, G5).
 * The AudioContext is created/resumed only inside a user gesture
 * (see architecture §5.4).
 */
function playChime(audioCtx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.value = freq;

    const startTime = audioCtx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

/**
 * Formats the next session label for use in a notification body.
 * Per SRS §4.4 and AC-5: "Work finished — time for a short break."
 * Both "short" and "long" start with a consonant, so "a" is always correct.
 */
function formatNextLabel(label: string): string {
  return 'a ' + label.toLowerCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SessionEndNotifierProps {
  /** Called by the timer to trigger chime + notification. */
  onSessionEnd: OnSessionEnd;
}

/**
 * SessionEndNotifier
 *
 * Manages the AudioContext lifecycle (created/resumed on first user gesture)
 * and the Notification permission lifecycle (requested on first Start press).
 * Fires the chime and notification whenever `onSessionEnd` is called.
 *
 * Graceful degradation per SRS TIMER-005/006:
 *   - Missing Notification API → silent skip, chime still plays.
 *   - Missing AudioContext     → silent skip, notification still fires.
 *   - Permission denied        → no notification, chime still plays.
 *   - AudioContext blocked     → no throw, degrades to notification only.
 */
export default function SessionEndNotifier({
  onSessionEnd,
}: SessionEndNotifierProps) {
  // Refs to avoid re-creating the AudioContext on every render.
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Track whether the AudioContext has been unlocked (resumed after suspension).
  const audioUnlockedRef = useRef(false);
  // Track whether permission has been requested on this session's Start.
  const permissionRequestedRef = useRef(false);
  // Current permission for the status line.
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Initialise permission state from the real API on mount.
    setPermission(getNotificationPermission());
  }, []);

  /** Request notification permission on the first Start press. */
  const requestNotificationPermission = useCallback(async () => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;

    if (!notificationsSupported()) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
    } catch {
      // Graceful degradation: permission request failed, continue silently.
    }
  }, []);

  /** Unlock AudioContext on the first user gesture (Start/Pause press). */
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;

    if (!audioContextSupported()) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          audioUnlockedRef.current = true;
        });
      } else {
        audioUnlockedRef.current = true;
      }
    } catch {
      // Graceful degradation: AudioContext unavailable, continue silently.
    }
  }, []);

  /** Called by the parent timer on every session end. */
  const handleSessionEnd = useCallback(
    (payload: SessionEndPayload) => {
      const { finished, next, labels } = payload;

      // ── 1. Play chime ───────────────────────────────────────────────────
      if (audioCtxRef.current && audioUnlockedRef.current) {
        try {
          playChime(audioCtxRef.current);
        } catch {
          // Graceful degradation: chime failed, notification still fires.
        }
      }

      // ── 2. Show browser notification ────────────────────────────────────
      if (notificationsSupported() && Notification.permission === 'granted') {
        try {
          const nextLabelLower = formatNextLabel(labels[next]);
          new Notification('Pomodoro Timer', {
            body: `${labels[finished]} finished — time for ${nextLabelLower}.`,
          });
        } catch {
          // Graceful degradation: notification failed, chime already played.
        }
      }

      // Delegate to the timer's own session-end handler (cycle advance, etc.).
      onSessionEnd(payload);
    },
    [onSessionEnd]
  );

  // Wire to window events dispatched by the timer (Story 3 integration point).
  // Audio unlock + permission request fire on the same Start user gesture.
  // Session end fires when the countdown reaches 0.
  useEffect(() => {
    const handleUnlock = () => {
      unlockAudio();
      requestNotificationPermission();
    };

    const handleEnd = (e: Event) => {
      handleSessionEnd((e as CustomEvent<SessionEndPayload>).detail);
    };

    window.addEventListener('pomodoro:unlock-audio', handleUnlock);
    window.addEventListener('pomodoro:session-end', handleEnd);

    return () => {
      window.removeEventListener('pomodoro:unlock-audio', handleUnlock);
      window.removeEventListener('pomodoro:session-end', handleEnd);
    };
  }, [unlockAudio, requestNotificationPermission, handleSessionEnd]);

  // This component is not visually rendered — it manages browser APIs in the background.
  // The NotificationStatus sub-component below renders the visible status line.
  return null;
}

// Re-export types for consumers that import from here.
export type { OnSessionEnd, NotificationPermission };
