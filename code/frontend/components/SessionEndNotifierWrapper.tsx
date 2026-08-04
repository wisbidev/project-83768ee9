/**
 * SessionEndNotifierWrapper — "use client"
 *
 * Wraps SessionEndNotifier so page.tsx (a Server Component) never passes a
 * function prop to a Client Component — which is illegal in Next.js App Router.
 *
 * The no-op onSessionEnd is wired here; story 3's session-cycle advance will
 * replace this wrapper with the real wired version.
 */

'use client';

import SessionEndNotifier from '@/components/SessionEndNotifier';

export default function SessionEndNotifierWrapper() {
  return (
    <SessionEndNotifier
      onSessionEnd={() => {
        // Integration point for story 3's session-cycle advance.
        // No-op here; story 3 wires the real cycle logic.
      }}
    />
  );
}
