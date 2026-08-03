'use client';

import styles from './CycleDots.module.css';

interface CycleDotsProps {
  /** 0-3: how many work sessions have completed in the current cycle */
  position: number;
  /** Total sessions per cycle (always 4) */
  total?: number;
}

export default function CycleDots({ position, total = 4 }: CycleDotsProps) {
  // Session N of 4 label: completed work sessions + 1 = current session number
  const currentSession = position + 1;

  return (
    <div className={styles.row}>
      <span className={styles.label} aria-label={`Session ${currentSession} of ${total}`}>
        Session {currentSession} of {total}
      </span>
      <div className={styles.dots} role="img" aria-label="Cycle progress dots">
        {Array.from({ length: total }, (_, i) => {
          const isDone    = i < position;         // work session i has completed
          const isCurrent = i === position;        // work session i is now active
          const className =
            isDone    ? `${styles.dot} ${styles.dotDone}`
            : isCurrent ? `${styles.dot} ${styles.dotActive}`
            : styles.dot;
          return <span key={i} className={className} aria-hidden="true" />;
        })}
      </div>
    </div>
  );
}
