// page.tsx is a Server Component — it only composes children.
// All interactive logic lives in Client Components ("use client") imported below.

import AppShell from '../components/AppShell';

export default function Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      <AppShell />
    </main>
  );
}
