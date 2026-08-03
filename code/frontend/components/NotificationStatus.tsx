/**
 * NotificationStatus — "use client"
 *
 * Displays the browser notification permission status line in the Settings card.
 * Visible only when permission is 'denied'; hidden otherwise.
 *
 * Per the SRS (#notifStatus, #notifStatusText), the blocked message uses
 * `.warn` styling and reads:
 *   "Browser notifications are blocked — you will get sound only.
 *    Allow notifications in your browser settings."
 *
 * Design tokens (globals.css / SRS §5):
 *   --color-primary  #E4572E  (warn background tint)
 *   --color-cream     #FBF6EF  (page background)
 *   --color-ink       #2B2B33  (body text)
 */

'use client';

import React, { useEffect, useState } from 'react';

type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

const BLOCKED_MESSAGE =
  'Browser notifications are blocked — you will get sound only. Allow notifications in your browser settings.';

function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermission;
}

/** NotificationStatus — renders the blocked-notification status line. */
export default function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Read the real permission on mount and after any change.
    setPermission(getNotificationPermission());

    // Watch for permission changes (e.g. user changes settings mid-session).
    const interval = setInterval(() => {
      setPermission(getNotificationPermission());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show the blocked message when permission is denied.
  if (permission !== 'denied') {
    return null;
  }

  return (
    <div
      id="notifStatus"
      role="status"
      aria-live="polite"
      className="mt-3 rounded px-3 py-2 text-sm leading-relaxed"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-ink)' }}
    >
      <span id="notifStatusText">{BLOCKED_MESSAGE}</span>
    </div>
  );
}
