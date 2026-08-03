// page.tsx is a Server Component — it only composes children.
// All interactive logic lives in Client Components ("use client") imported below.
// Do NOT add browser APIs, React state, or event handlers to this file.

import TimerCard from '@/components/TimerCard';

export default function Page() {
  return <TimerCard />;
}
