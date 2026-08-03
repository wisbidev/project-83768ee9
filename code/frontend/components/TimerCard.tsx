'use client';

import { useState, useEffect } from 'react';
import {
  buildInitialState,
  formatTime,
  SESSION_META,
  DEFAULT_WORK_DURATION_MINUTES,
  type SessionType,
} from '@/lib/mock/countdown-display-and-session-type';

// Radius constants for the SVG progress ring
const RING_RADIUS = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 741.4

interface TimerCardProps {
  initialSessionType?: SessionType;
}

export default function TimerCard({
  initialSessionType = 'work',
}: TimerCardProps) {
  const [sessionType, setSessionType] = useState<SessionType>(initialSessionType);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    initialSessionType === 'work'
      ? DEFAULT_WORK_DURATION_MINUTES * 60
      : initialSessionType === 'short'
      ? 5 * 60
      : 15 * 60
  );
  const [totalSeconds, setTotalSeconds] = useState<number>(remainingSeconds);

  // Safe load from localStorage — fall back to defaults on error
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pomodoro_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Use stored work duration if valid
        if (parsed?.workDuration && Number.isInteger(parsed.workDuration) && parsed.workDuration > 0) {
          const dur = parsed.workDuration;
          setTotalSeconds(dur * 60);
          setRemainingSeconds(dur * 60);
        }
      }
    } catch {
      // Corrupted storage — fall through to defaults
    }
  }, []);

  const meta = SESSION_META[sessionType];

  // Progress: 1 = full ring (100 % remaining), 0 = empty
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  // Ring colour per session type
  const ringStroke =
    sessionType === 'short'
      ? '#2F9E77'
      : sessionType === 'long'
      ? '#3B6FE0'
      : '#E4572E';

  // Pill colour classes per session type
  const pillBgClass =
    sessionType === 'short'
      ? 'bg-[var(--color-short-soft,#DDF0E8)] text-[#2F9E77]'
      : sessionType === 'long'
      ? 'bg-[var(--color-long-soft,#DDE7FB)] text-[#3B6FE0]'
      : 'bg-[var(--color-tomato-soft,#FCE4D8)] text-[#C74420]';

  const timeDisplay = formatTime(remainingSeconds);

  return (
    <section
      className="card timer-card flex flex-col items-center text-center relative overflow-hidden rounded-[24px] border border-[var(--color-line,#EFE6DC)] bg-white px-6 pt-10 pb-8 shadow-[0_18px_50px_-18px_rgba(228,87,46,0.25)]"
      aria-label="Timer"
    >
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(320px 180px at 50% 0%, rgba(228, 87, 46, 0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Session-type pill */}
      <span
        className={`session-pill relative z-10 inline-flex items-center gap-2 rounded-full bg-[var(--color-tomato-soft,#FCE4D8)] px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-colors duration-[350ms] ${pillBgClass}`}
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
        <span id="sessionName">{meta.label}</span>
      </span>

      {/* Progress ring */}
      <div
        className={`ring-wrap relative mt-6 mb-2 w-[260px] h-[260px]`}
        style={{ width: 260, height: 260 }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 260 260"
          className="h-full w-full"
          style={{ transform: 'rotate(-90deg)' }}
          role="img"
          aria-label={`Time remaining ring, ${formatTime(remainingSeconds)} remaining`}
        >
          {/* Track */}
          <circle
            cx={130}
            cy={130}
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-track,#F1E7DB)"
            strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={130}
            cy={130}
            r={RING_RADIUS}
            fill="none"
            stroke={ringStroke}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.35s ease',
              filter:
                sessionType === 'short'
                  ? 'drop-shadow(0 0 6px rgba(47, 158, 119, 0.35))'
                  : sessionType === 'long'
                  ? 'drop-shadow(0 0 6px rgba(59, 111, 224, 0.35))'
                  : 'drop-shadow(0 0 6px rgba(228, 87, 46, 0.35))',
            }}
          />
        </svg>

        {/* Time centre overlay */}
        <div className="time-center absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className="time text-[58px] font-extrabold tracking-tight leading-none tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {timeDisplay}
          </div>
          <div className="time-sub text-[13px] text-[var(--color-muted,#9C918A)] font-semibold min-h-[18px]">
            {meta.hint}
          </div>
        </div>
      </div>

      {/* Controls placeholder — implemented in story 2 */}
      {/* (start/pause/reset buttons will be added by the controls story) */}
    </section>
  );
}
