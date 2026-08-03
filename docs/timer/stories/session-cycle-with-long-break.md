# Story — Session cycle with long break

Plan item: **3. Session cycle with long break** (module `timer`, P1)
Implements: TIMER-004 (Automatic cycle order)
Branch: `docs/story-session-cycle-with-long-break`

## User story

As a User, I want the timer to advance automatically from Work to a Short
Break, and to a Long Break after every fourth completed Work session, so that
I never have to set the next session myself.

## In scope

- When a Work session's countdown reaches zero, the timer advances to a Short
  Break.
- When a Short Break's countdown reaches zero, the timer advances to Work.
- When a Long Break's countdown reaches zero, the timer advances to Work and
  the cycle position resets to 0 (session 1 of 4).
- After every fourth completed Work session, the timer advances to a Long
  Break instead of a Short Break.
- On every advance the new session starts **paused** at the full duration of
  its own type (saved durations, defaulting to `25 / 5 / 15` until the
  settings story lands).
- On every advance the session-type label, the pill and ring colour, and the
  cycle-dot row update immediately to the new session.
- Cycle-dot row: label `Session N of 4` (N = completed Work sessions + 1),
  completed dots filled, the current session's dot highlighted, upcoming dots
  empty; all dots empty at session 1 of 4.
- Transition toasts per the approved design: on a Work session end,
  `Work complete — time for a short break!` (green) or
  `Cycle complete! You earned a long break.` (blue, on the 4th); on a break
  end, `Break over — back to work.` (tomato).
- Cycle position is held in memory only (never persisted): a reload restarts
  at Work, session 1 of 4.

## Out of scope

- End-of-session sound chime and browser notification — own story (item 4);
  the session-end handler must remain a single hook these stories extend.
- Daily counter increment on completed Work sessions — own story (item 5).
- Settings card, duration inputs, and persistence of durations — own story
  (item 6). This story only reads durations from `pomodoro:settings` with
  `25 / 5 / 15` defaults.
- Keyboard shortcuts (`Space`, `R`) — covered by the controls story (item 2).
- The per-session hint line under the countdown ("Stay focused", etc.) —
  covered by the countdown/session-type story (item 1).
- Persisting the cycle position across reloads — deliberately not built; the
  timer restarts at Work on reload (SRS §7 assumption).

## UI scope

Single page, Timer card only (plus the toast element). No new screens.

- **Session-type pill** — label and colour per type on every transition:
  `Work` tomato `#E4572E`, `Short Break` green `#2F9E77`, `Long Break` blue
  `#3B6FE0`. The pill and the progress-ring colour follow the current type.
- **Cycle-dot row** — `Session N of 4` label and four dots
  (`.dot-session`): `done` (filled tomato) for completed sessions, `active`
  (ring highlight) for the current one, empty for upcoming. Colour + fill both
  convey state; never colour alone.
- **Toast** — bottom-centre feedback, coloured dot per the design
  (green/blue/tomato) as listed in scope.

## Acceptance criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A running Work session | its countdown reaches 0 | the label reads `Short Break`, the countdown shows the short duration (`05:00` by default), paused; a green toast `Work complete — time for a short break!` shows |
| AC-2 | A running Short Break | its countdown reaches 0 | the label reads `Work`, the countdown shows the work duration (`25:00` by default), paused; the cycle position is unchanged |
| AC-3 | Work sessions 1–3 of a cycle completed (label `Session 4 of 4`, dots 1–3 filled, dot 4 active) | the 4th Work session reaches 0 | the label reads `Long Break`, the countdown shows the long duration (`15:00` by default), paused; a blue toast `Cycle complete! You earned a long break.` shows |
| AC-4 | A running Long Break | its countdown reaches 0 | the label reads `Work`, the countdown shows the work duration, paused; the label reads `Session 1 of 4` and all four dots are empty (cycle reset) |
| AC-5 | Any completed Work session in a cycle | the advance happens | the label `Session N of 4` and the dots update: the completed session's dot becomes filled and the next session's dot becomes active |
| AC-6 | Any session has just advanced | 3 seconds pass without pressing Start | the countdown still reads the full duration of the new session (new session starts paused; no time elapses) |
| AC-7 | A Work session ends as the 4th of a cycle, then again as the 1st of the next cycle | each advance completes | the first transition lands on `Long Break`, the second on `Short Break` — the 4-session cadence repeats |

## Failure and boundary behaviour

| Case | Condition | Expected behaviour |
|---|---|---|
| Break paused mid-countdown | A break never reaches 0 | No advance happens; the cycle only advances when the countdown actually reaches zero (wall-clock derived) |
| Reset during a session | User presses Reset on any session | The current session restarts at its full duration, paused; the session type and cycle position are unchanged |
| Settings changed mid-cycle | User changes durations between sessions | Cycle order and dot state are unchanged; only future session durations are affected |
| Double-fire of session end | Session end fires twice for the same completion | The cycle advances exactly once; the new session starts paused, so it cannot immediately re-advance |
| Reload mid-cycle | User reloads the page | Cycle position starts at 0; the timer shows Work, session 1 of 4, stopped (SRS §7 assumption) |

## Dependencies

- **Stories that must land first:** item 1 (Countdown display and session
  type) and item 2 (Start, pause and reset controls) — they define the
  session-type/state model, the countdown rendering, and the running timer
  that reaches zero to trigger the advance.
- **Design:** approved — colours, cycle dots, and toast copy from
  `design/index.html` and SRS §5.
- **No external accounts, data, or services.**
