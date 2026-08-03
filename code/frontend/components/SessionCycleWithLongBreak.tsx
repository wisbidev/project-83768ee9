'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MOCK_INITIAL_STATE,
  SESSION_META,
  type TimerState,
  type SessionType,
  type CycleDotState,
  type DotState,
  deriveCycleDots,
  cycleLabelText,
  formatTime,
  getNextSessionType,
  getToastMessage,
  DEFAULT_DURATIONS,
} from '../lib/mock/session-cycle-with-long-break';

const RING_RADIUS = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Inline design tokens — hex values from design spec, no external deps needed
const TOKENS = {
  'tomato-soft': '#FCE4D8',
  'tomato-glow': 'rgba(228,87,46,0.35)',
  'short-glow':  'rgba(47,158,119,0.35)',
  'long-glow':   'rgba(59,111,224,0.35)',
  'tomato-deep': '#C74420',
  'ink-deep':    '#1d1d23',
} as const;

function Dot({ state }: { state: DotState }) {
  const base = 'inline-block w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0';
  if (state === 'done') {
    return (
      <span
        className={`${base} bg-primary scale-[1.15]`}
        aria-hidden="true"
      />
    );
  }
  if (state === 'active') {
    return (
      <span
        className={`${base} bg-primary`}
        style={{ boxShadow: `0 0 0 4px ${TOKENS['tomato-soft']}` }}
        aria-hidden="true"
      />
    );
  }
  return <span className={`${base} bg-track`} aria-hidden="true" />;
}

interface CycleDotsProps {
  dots: CycleDotState[];
  label: string;
}

function CycleDots({ dots, label }: CycleDotsProps) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 mt-5 z-10"
      role="group"
      aria-label="Session cycle progress"
    >
      <span className="text-[13px] text-muted font-semibold">{label}</span>
      <div className="flex gap-2.5">
        {dots.map((dot) => (
          <Dot key={dot.position} state={dot.state} />
        ))}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  progress: number; // 0–1 fraction remaining
  sessionType: SessionType;
  isRunning: boolean;
  remainingFormatted: string;
  hint: string;
  isPaused: boolean;
}

function ProgressRing({
  progress,
  sessionType,
  isRunning,
  remainingFormatted,
  hint,
  isPaused,
}: ProgressRingProps) {
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  const strokeColor =
    sessionType === 'short'
      ? '#2F9E77'
      : sessionType === 'long'
      ? '#3B6FE0'
      : '#E4572E';

  const glowColor =
    sessionType === 'short'
      ? TOKENS['short-glow']
      : sessionType === 'long'
      ? TOKENS['long-glow']
      : TOKENS['tomato-glow'];

  return (
    <div className="relative w-[260px] h-[260px]">
      <svg
        viewBox="0 0 260 260"
        className="w-full h-full rotate-[-90deg]"
        role="img"
        aria-label={`Time remaining: ${remainingFormatted}`}
      >
        {/* Track */}
        <circle
          cx="130"
          cy="130"
          r={RING_RADIUS}
          fill="none"
          stroke="#F1E7DB"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="130"
          cy="130"
          r={RING_RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 linear"
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-[58px] font-extrabold tracking-tighter tabular-nums leading-none text-ink">
          {remainingFormatted}
        </span>
        <span className="text-[13px] text-muted font-semibold min-h-[18px]">
          {hint}
        </span>
        {isPaused && (
          <span className="mt-0.5 text-[11px] font-extrabold uppercase tracking-widest text-muted bg-[#F3EDE5] px-2.5 py-0.5 rounded-full">
            Paused
          </span>
        )}
      </div>
    </div>
  );
}

interface ToastProps {
  message: string | null;
  variant: 'tomato' | 'green' | 'blue' | null;
  visible: boolean;
}

function Toast({ message, variant, visible }: ToastProps) {
  const dotColor =
    variant === 'green' ? '#2F9E77' : variant === 'blue' ? '#3B6FE0' : '#E4572E';

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed left-1/2 bottom-6 -translate-x-1/2',
        'bg-ink text-white text-sm font-semibold',
        'px-5 py-3 rounded-2xl',
        'opacity-0 pointer-events-none transition-all duration-300',
        'max-w-[calc(100vw-40px)] text-center',
        visible ? 'opacity-100' : 'translate-y-6',
        visible ? '' : 'translate-y-0',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        boxShadow: '0 16px 40px -12px rgba(43,43,51,0.5)',
        transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 24px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {variant && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      )}
      {message ?? ''}
    </div>
  );
}

export default function SessionCycleWithLongBreak() {
  // Timer state driven by mock
  const [timerState, setTimerState] = useState<TimerState>(MOCK_INITIAL_STATE);

  // Toast visibility
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'tomato' | 'green' | 'blue' | null>(null);

  // Derived values
  const meta = SESSION_META[timerState.sessionType];
  const progress =
    timerState.totalSeconds > 0
      ? timerState.remainingSeconds / timerState.totalSeconds
      : 1;
  const cycleDots = deriveCycleDots(timerState.cyclePosition, timerState.workSessionsDone);
  const cycleLabel = cycleLabelText(timerState.cyclePosition);
  const remainingFormatted = formatTime(timerState.remainingSeconds);

  // Show toast helper (auto-hides after 3.5s)
  const showToast = useCallback(
    (msg: string, var_: 'tomato' | 'green' | 'blue') => {
      setToastMessage(msg);
      setToastVariant(var_);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3500);
    },
    []
  );

  // Simulate countdown tick
  useEffect(() => {
    if (!timerState.isRunning) return;
    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (prev.remainingSeconds <= 1) {
          // Session ended — advance to next session
          const newWorkSessionsDone =
            prev.sessionType === 'work' ? prev.workSessionsDone + 1 : prev.workSessionsDone;
          const nextType = getNextSessionType(prev.sessionType, prev.workSessionsDone);
          const nextDuration = DEFAULT_DURATIONS[nextType];
          const toastMsg = getToastMessage(prev.sessionType, nextType);

          if (toastMsg) showToast(toastMsg.text, toastMsg.variant);

          return {
            ...prev,
            sessionType: nextType,
            remainingSeconds: nextDuration,
            totalSeconds: nextDuration,
            isRunning: false, // starts paused after advance
            isPaused: true,
            workSessionsDone:
              nextType === 'work' && prev.sessionType === 'long'
                ? 0
                : newWorkSessionsDone,
            cyclePosition:
              nextType === 'work' && prev.sessionType === 'long'
                ? 1
                : nextType === 'work'
                ? prev.cyclePosition + 1
                : prev.cyclePosition,
          };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, showToast]);

  const handleStart = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
  };

  const handlePause = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  };

  const handleReset = () => {
    setTimerState((prev) => ({
      ...prev,
      remainingSeconds: prev.totalSeconds,
      isRunning: false,
      isPaused: true,
    }));
  };

  // Pill colour classes per session type
  const pillClass =
    timerState.sessionType === 'short'
      ? 'bg-[#DDF0E8] text-[#2F9E77]'
      : timerState.sessionType === 'long'
      ? 'bg-[#DDE7FB] text-[#3B6FE0]'
      : 'bg-[#FCE4D8] text-[#C74420]';

  return (
    <>
      {/* Timer Card */}
      <section
        className="bg-white rounded-3xl border border-[#EFE6DC] relative overflow-hidden w-full max-w-sm mx-auto flex flex-col items-center text-center"
        style={{ boxShadow: '0 18px 50px -18px rgba(228,87,46,0.25)', padding: '34px 24px 26px' }}
        aria-label="Pomodoro timer"
      >
        {/* Ambient gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(320px 180px at 50% 0%, rgba(228,87,46,0.06), transparent 70%)' }}
        />

        {/* Session pill */}
        <div
          className={`inline-flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-300 z-10 ${pillClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
          <span>{meta.name}</span>
        </div>

        {/* Progress ring */}
        <div className="mt-5 mb-2">
          <ProgressRing
            progress={progress}
            sessionType={timerState.sessionType}
            isRunning={timerState.isRunning}
            remainingFormatted={remainingFormatted}
            hint={meta.hint}
            isPaused={timerState.isPaused}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-1 z-10">
          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-13 h-13 rounded-full border border-[#EFE6DC] bg-white text-muted hover:text-[#C74420] hover:border-[#C74420] transition-all duration-200 active:scale-95 flex items-center justify-center focus-visible:outline-primary focus-visible:outline focus-visible:outline-offset-2"
            aria-label="Reset timer"
            title="Reset (R)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>

          {/* Start / Pause button */}
          <button
            onClick={timerState.isRunning ? handlePause : handleStart}
            className={[
              'inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full font-extrabold text-base transition-all duration-200 active:scale-95',
              timerState.isRunning
                ? 'bg-ink text-white'
                : 'text-white',
            ].join(' ')}
            style={
              timerState.isRunning
                ? { boxShadow: '0 12px 26px -12px rgba(43,43,51,0.5)' }
                : { backgroundColor: '#E4572E', boxShadow: '0 12px 26px -10px rgba(228,87,46,0.55)' }
            }
            aria-pressed={timerState.isRunning}
          >
            {timerState.isRunning ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4.5 L20 12 L7 19.5 Z" />
                </svg>
                Start
              </>
            )}
          </button>
        </div>

        {/* Cycle dots */}
        <CycleDots dots={cycleDots} label={cycleLabel} />
      </section>

      {/* Toast notification */}
      <Toast message={toastMessage} variant={toastVariant} visible={toastVisible} />
    </>
  );
}
