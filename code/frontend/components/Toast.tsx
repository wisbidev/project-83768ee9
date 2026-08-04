'use client';

/**
 * Toast — fixed-position confirmation message.
 *
 * Auto-dismisses after `duration` ms (default 3000).
 * Pass `visible` to control show/hide from the parent.
 */

import { useEffect, useRef } from 'react';
import styles from './Toast.module.css';

export type ToastVariant = 'tomato' | 'green' | 'blue' | 'ink';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  /** Controls visibility via CSS class toggle. */
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

  return (
    <div
      className={`${styles.toast} ${visible ? styles.visible : ''} ${styles[variant]}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {message}
    </div>
  );
}
