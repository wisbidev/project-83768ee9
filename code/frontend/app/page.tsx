// page.tsx is a Server Component — it only composes children.
// All interactive logic lives in Client Components ("use client") imported below.
// Do NOT add browser APIs, React state, or event handlers to this file.

import SessionCycleTimer from '@/components/SessionCycleTimer';

export default function Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      <SessionCycleTimer />
    </main>
  );
}
