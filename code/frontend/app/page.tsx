// page.tsx is a Server Component — it only composes children.
// All interactive logic lives in Client Components ("use client") imported below.
// Do NOT add browser APIs, React state, or event handlers to this file.

import DemoSessionEndTimer from '@/components/DemoSessionEndTimer';
import SessionEndNotifier from '@/components/SessionEndNotifier';
import NotificationStatus from '@/components/NotificationStatus';
import type { SessionEndPayload } from '@/components/SessionEndNotifier';
import { SESSION_LABELS } from '@/lib/mock/end-of-session-sound-and-notification';

export default function Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Story 4: End-of-session sound and notification UI demo */}
      <div className="w-full max-w-sm space-y-6">
        <h1
          className="text-center text-xl font-semibold tracking-tight"
          style={{ color: 'var(--color-ink)' }}
        >
          End-of-Session Sound &amp; Notification
        </h1>

        {/* Demo timer — simulates stories 1–3 for demonstration */}
        <DemoSessionEndTimer labels={SESSION_LABELS} />

        {/* Notification status line — shows only when permission is denied */}
        <NotificationStatus />
      </div>

      {/* Background manager: handles chime playback and notification dispatch */}
      <SessionEndNotifier
        onSessionEnd={(payload: SessionEndPayload) => {
          // Integration point for story 3's session-cycle advance.
          // No-op here; story 3 wires the real cycle logic.
        }}
      />
    </main>
  );
}
