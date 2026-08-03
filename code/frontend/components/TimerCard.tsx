"use client";

import { useState } from 'react';
import {
  SESSION_META,
  DURATIONS,
  type SessionType,
  type TimerResult,
  fetchInitialTimer,
  fetchTimerLoading,
  fetchTimerError,
} from '@/lib/mock/countdown-display-and-session-type';

// ── Ring geometry (matches design/index.html) ────────────────────────────────

const RING_SIZE   = 260;
const RING_R      = 118;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 741.76

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TimerCardProps {
  /** Override the initial result — used by tests to inject different states */
  initialResult?: TimerResult;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimerCard({ initialResult }: TimerCardProps) {
  const [sessionType, setSessionType]       = useState<SessionType>('work');
  const [remainingSeconds, setRemaining]    = useState(DURATIONS.work);
  const [status, setStatus]                 = useState<'idle' | 'running' | 'paused'>('idle');
  const [result, setResult]                = useState<TimerResult | null>(initialResult ?? null);

  // Load timer state on mount (unless already provided)
  if (result === null && initialResult === undefined) {
    fetchInitialTimer()
      .then(res => setResult(res))
      .catch(() => setResult({ error: true, message: 'Unable to load timer. Please refresh.' }));
  }

  const resolved: TimerResult = initialResult !== undefined
    ? initialResult
    : (result ?? { loading: true });

  // ── Derived values ─────────────────────────────────────────────────────────

  const totalSeconds   = DURATIONS[sessionType];
  const progress       = remainingSeconds / totalSeconds; // 1 = full, 0 = empty
  const strokeOffset   = RING_CIRCUMFERENCE * (1 - progress);
  const meta           = SESSION_META[sessionType];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      className="w-full max-w-sm mx-auto bg-white rounded-[24px] border border-[#EFE6DC] shadow-[0_18px_50px_-18px_rgba(228,87,46,0.25)] px-6 pt-9 pb-7 flex flex-col items-center text-center relative overflow-hidden"
      aria-label="Timer"
    >
      {/* Ambient radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            sessionType === 'work'
              ? 'radial-gradient(320px 180px at 50% 0%, rgba(228,87,46,0.06), transparent 70%)'
              : sessionType === 'short'
              ? 'radial-gradient(320px 180px at 50% 0%, rgba(47,158,119,0.06), transparent 70%)'
              : 'radial-gradient(320px 180px at 50% 0%, rgba(59,111,224,0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Session pill ──────────────────────────────────────────────────── */}
      <LoadingOrErrorOrContent resolved={resolved}>
        <SessionPill sessionType={sessionType} meta={meta} />
      </LoadingOrErrorOrContent>

      {/* ── Progress ring ─────────────────────────────────────────────────── */}
      <LoadingOrErrorOrContent resolved={resolved}>
        <ProgressRing
          sessionType={sessionType}
          strokeOffset={strokeOffset}
          circumference={RING_CIRCUMFERENCE}
        />
      </LoadingOrErrorOrContent>

      {/* ── Time + hint ───────────────────────────────────────────────────── */}
      <LoadingOrErrorOrContent resolved={resolved}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className="text-[58px] font-extrabold tracking-tight leading-none tabular-nums"
            style={{ color: 'var(--color-ink)' }}
            aria-live="off"
          >
            {formatTime(remainingSeconds)}
          </div>
          <div className="text-[13px] text-[#9C918A] font-semibold min-h-[18px]">
            {meta.hint}
          </div>
        </div>
      </LoadingOrErrorOrContent>

      {/* ── Paused badge (shown when status is idle/paused) ───────────────── */}
      <LoadingOrErrorOrContent resolved={resolved}>
        {status !== 'running' && (
          <div className="absolute bottom-[148px] text-[11px] font-extrabold uppercase tracking-widest text-[#9C918A] bg-[#F3EDE5] px-3 py-1 rounded-full">
            Paused
          </div>
        )}
      </LoadingOrErrorOrContent>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SessionPill({
  sessionType,
  meta,
}: {
  sessionType: SessionType;
  meta: { label: string; pillClass: string };
}) {
  const colorClass =
    sessionType === 'short'
      ? 'bg-[#DDF0E8] text-[#2F9E77]'
      : sessionType === 'long'
      ? 'bg-[#DDE7FB] text-[#3B6FE0]'
      : 'bg-[#FCE4D8] text-[#C74420]';

  return (
    <span
      className={`inline-flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.08em] px-4 py-[7px] rounded-full z-10 transition-colors duration-300 ${colorClass}`}
    >
      <span
        className="w-[7px] h-[7px] rounded-full"
        style={{
          background:
            sessionType === 'short'
              ? '#2F9E77'
              : sessionType === 'long'
              ? '#3B6FE0'
              : '#C74420',
        }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}

function ProgressRing({
  sessionType,
  strokeOffset,
  circumference,
}: {
  sessionType: SessionType;
  strokeOffset: number;
  circumference: number;
}) {
  const strokeColor =
    sessionType === 'short'
      ? '#2F9E77'
      : sessionType === 'long'
      ? '#3B6FE0'
      : '#E4572E';

  const filterId = `ring-glow-${sessionType}`;

  return (
    <div
      className={`relative w-[260px] h-[260px] my-5${sessionType === 'short' ? ' is-green' : sessionType === 'long' ? ' is-blue' : ''}`}
    >
      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
        role="img"
        aria-label="Time remaining ring"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor={strokeColor}
              floodOpacity="0.35"
            />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          fill="none"
          stroke="#F1E7DB"
          strokeWidth={10}
        />
        {/* Progress */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          filter={`url(#${filterId})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.35s ease' }}
        />
      </svg>
    </div>
  );
}

// ── State renderers ───────────────────────────────────────────────────────────

function LoadingOrErrorOrContent({
  resolved,
  children,
}: {
  resolved: TimerResult;
  children: React.ReactNode;
}) {
  if ('loading' in resolved) {
    return <LoadingSkeleton />;
  }
  if ('error' in resolved) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E4572E" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-[#9C918A] text-sm font-medium">{resolved.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-bold text-[#E4572E] underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function LoadingSkeleton() {
  return (
    <div className="w-full flex flex-col items-center gap-4 py-10" aria-busy="true" aria-label="Loading timer">
      {/* Pill skeleton */}
      <div className="h-8 w-24 bg-[#F1E7DB] rounded-full animate-pulse" />
      {/* Ring skeleton */}
      <div className="w-[260px] h-[260px] rounded-full bg-[#F1E7DB] animate-pulse flex items-center justify-center">
        <div className="w-[200px] h-[200px] rounded-full bg-[#EFE6DC] animate-pulse" />
      </div>
      {/* Time skeleton */}
      <div className="h-12 w-32 bg-[#F1E7DB] rounded-xl animate-pulse" />
    </div>
  );
}
