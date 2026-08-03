'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Toast.module.css';

export type ToastVariant = 'tomato' | 'green' | 'blue' | 'ink';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  /** Duration in ms the toast stays visible (default 3000) */
  duration?: number;
}

export default function Toast({ message, variant, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending hide timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Show toast
    setVisible(true);

    // Hide after duration
    timerRef.current = setTimeout(() => setVisible(false), duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, duration]);

  const className = [
    styles.toast,
    styles[variant],
    visible ? styles.visible : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={styles.dot} aria-hidden="true" />
      {message}
    </div>
  );
}
