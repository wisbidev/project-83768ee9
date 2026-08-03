// page.tsx is a Server Component — it only composes children.
// All interactive logic lives in Client Components ("use client") imported below.

import SettingsCard from '../components/SettingsCard';
import Toast from '../components/Toast';

export default function Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 px-4 py-8">
      <SettingsCard />
      <Toast />
    </main>
  );
}
