'use client';

/**
 * Toast notification component.
 *
 * Fires a toast message from anywhere in the app by dispatching a custom event
 * on the document.  No prop-drilling or context required.
 *
 * Usage:
 *   import { showToast } from './Toast';
 *   showToast('Settings saved — applied to the current session.', 'ink');
 */

import { useEffect, useRef, useState } from 'react';

type ToastVariant = 'ink' | 'tomato' | 'green' | 'blue';

interface ToastState {
  message: string;
  variant: ToastVariant;
  visible: boolean;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function showToast(message: string, variant: ToastVariant = 'ink'): void {
  document.dispatchEvent(
    new CustomEvent<{ message: string; variant: ToastVariant }>('app:toast', {
      detail: { message, variant },
    }),
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Toast() {
  const [{ message, variant, visible }, setState] = useState<ToastState>({
    message: '',
    variant: 'ink',
    visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleToast(e: Event) {
      const { message: msg, variant: v } = (
        e as CustomEvent<{ message: string; variant: ToastVariant }>
      ).detail;
      if (timerRef.current) clearTimeout(timerRef.current);
      setState({ message: msg, variant: v, visible: true });
      timerRef.current = setTimeout(() => {
        setState((s) => ({ ...s, visible: false }));
      }, 3000);
    }

    document.addEventListener('app:toast', handleToast);
    return () => {
      document.removeEventListener('app:toast', handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed left-1/2 bottom-7 -translate-x-1/2 translate-y-6',
        'bg-ink text-white text-sm font-semibold',
        'px-5 py-3.5 rounded-2xl',
        'shadow-[0_16px_40px_-12px_rgba(43,43,51,0.5)]',
        'opacity-0 pointer-events-none transition-all duration-300',
        'max-w-[calc(100vw-40px)] text-center z-50',
        visible ? 'opacity-100 !translate-y-0' : '',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block w-2 h-2 rounded-full mr-2 align-middle',
          variant === 'ink'    ? 'bg-white'    :
          variant === 'tomato' ? 'bg-primary'  :
          variant === 'green'  ? 'bg-short'    :
                                 'bg-long'
        ].join(' ')}
        aria-hidden="true"
      />
      {message}
    </div>
  );
}
