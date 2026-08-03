'use client';

import { useEffect, useRef } from 'react';
import styles from './Toast.module.css';
import type { ToastVariant } from './Toast.module.css';

export type ToastVariantColor = 'tomato' | 'green' | 'blue' | 'ink';

export interface ToastProps {
  message: string;
  variant?: ToastVariantColor;
  /** Controls visibility. Component unmounts (returns null) when not visible. */
  visible: boolean;
  /** Auto-dismiss delay in ms. Default 3000. Set to 0 to disable. */
  duration?: number;
  onDismiss?: () => void;
}

export default function Toast({
  message,
  variant = 'ink',
  visible,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (duration <= 0 || !onDismiss) return;

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.toast} ${styles[variant]}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {message}
    </div>
  );
}
