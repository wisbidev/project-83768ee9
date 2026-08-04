'use client';

/**
 * TimerCard — the primary timer screen.
 *
 * Owns the session state for this story:
 *   sessionType, remainingSeconds, totalSeconds, timerStatus
 *
 * In this story the timer starts idle (not running) at full duration.
 * TimerControls (story 2) will be composed inside this card in a later PR.
 *
 * All values come from the design tokens in globals.css / tailwind.config.ts.
 * Colours: --color-primary (tomato), --color-short (green), --color-long (blue),
 *          --color-cream, --color-ink
 */

import { useState } from 'react';
import {
  INITIAL_TIMER_STATE,
  SESSION_META,
  type SessionType,
} from '../lib/mock/countdown-display-and-session-type';
import SessionPill from './SessionPill';
import ProgressRing from './ProgressRing';
import CountdownDisplay from './CountdownDisplay';
import styles from './TimerCard.module.css';

export default function TimerCard() {
  const [sessionType]       = useState<SessionType>(INITIAL_TIMER_STATE.sessionType);
  const [remainingSeconds]  = useState(INITIAL_TIMER_STATE.remainingSeconds);
  const [totalSeconds]      = useState(INITIAL_TIMER_STATE.totalSeconds);

  const meta = SESSION_META[sessionType];

  return (
    <section
      className={styles.card}
      aria-label="Timer"
    >
      {/* Session-type pill */}
      <SessionPill sessionType={sessionType} />

      {/* Progress ring + countdown overlay */}
      <div className={styles.ringContainer}>
        <ProgressRing
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          sessionType={sessionType}
          ariaLabel="Time remaining ring"
        />

        {/* Countdown overlaid in the centre of the ring */}
        <div className={styles.ringCenter}>
          <CountdownDisplay
            remainingSeconds={remainingSeconds}
            sessionType={sessionType}
            ariaLive="off"
          />
        </div>
      </div>
    </section>
  );
}
