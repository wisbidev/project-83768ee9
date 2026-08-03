# Story — Start, pause and reset controls

**Module:** `timer`
**Plan item:** 2 — Start, pause and reset controls
**SRS:** `docs/timer/SRS.md` §4.2 (TIMER-002, TIMER-003)
**Design:** `design/index.html` — Timer card (`#startBtn`, `#resetBtn`, `.paused-badge`) and footer keyboard hint

## User story

*As a* User, *I want to* start, pause and reset the current session's countdown, *so that* I control exactly when time is counted and can restart a session at full duration whenever I like.

## In scope

- Primary Start/Pause button (`#startBtn`): label reads **Start** while idle or paused, **Pause** while running; clicking toggles the countdown.
- Start begins the countdown from the current remaining time; Pause freezes it at the current value; Start again resumes from the frozen value.
- Reset icon button (`#resetBtn`): stops the countdown and restores the current session to its full duration, leaving it paused. It never changes the session type and never touches the daily counter or cycle position.
- Countdown derived from the wall clock (timestamp delta), so it stays accurate when the tab is in the background — never from counting ticks.
- Keyboard shortcuts: `Space` toggles start/pause, `R` resets — each only when no input field or button has focus.
- Running-state feedback: primary button label toggles Start/Pause, ink background while running, `aria-pressed` reflects state; "Paused" badge shows only while paused mid-session (remaining < total).
- When the countdown reaches 0, the timer stops (running = false, remaining = 0). Everything that happens after zero is out of this story's scope.

## Out of scope

- Automatic advance to the next session when a session reaches 0 — story 3 (Session cycle with long break).
- End-of-session sound and browser notification — story 4.
- Cycle dots and the "Session N of 4" label — stories 1 and 3.
- Session-type pill and progress ring rendering — story 1; this story only feeds it state.
- Changing or persisting durations — story 6 (Settings).
- Daily counter increments and persistence — story 5; Reset must not affect it.
- Persisting the in-flight session across a reload — SRS assumption: a reload restores settings and the counter but restarts the timer at a full Work session, paused.

## UI scope

This story has UI and must go through the UI stages. It touches the Timer card and the footer of the approved design:

- **Start/Pause button** (`#startBtn`): "Start" when idle or paused, "Pause" while running; `.is-running` ink background (`#2B2B33`) while running; `aria-pressed` set to match.
- **Reset button** (`#resetBtn`): icon button, `aria-label="Reset timer"`, tooltip "Reset (R)".
- **Paused badge** (`.paused-badge`): visible only while paused with time already consumed.
- **Footer hint**: "Press `Space` to start or pause, `R` to reset." — the shortcuts must behave as the hint promises.

The controls must work for all three session types (Work / Short Break / Long Break) since Reset must preserve the current type; no new palette colours and no edits to `globals.css`.

## Acceptance criteria

Observable behaviours — Test derives cases directly from these:

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A fresh Work session at `25:00`, paused | the User presses Start and waits 65 seconds | the countdown reads `23:55` |
| AC-2 | The timer is running | the User presses Pause | the countdown freezes and stays at the same value until Start is pressed again |
| AC-3 | The timer is paused at `12:30` | the User presses Start | the countdown resumes from `12:30` |
| AC-4 | The primary button is paused | it reads "Start" and `aria-pressed="false"`; while running it reads "Pause" and `aria-pressed="true"` | the label, background and aria state match the running state at all times |
| AC-5 | No input or button has focus | the User presses `Space` | the timer toggles exactly as with the button (start↔pause) |
| AC-6 | The timer is running | the tab is hidden for 10 seconds and then shown | the countdown has decreased by 10 seconds — no drift |
| AC-7 | A running Work session at `10:15` | the User presses Reset | the countdown stops and reads `25:00`, paused |
| AC-8 | A Short Break session with a 5-minute duration | the User presses Reset | the countdown reads `05:00` and the session is still labelled Short Break |
| AC-9 | The session is paused at its full duration | the User presses Reset | nothing changes (no-op) |
| AC-10 | The timer is running or paused | the User presses `R` (with no input focused) | the timer resets exactly as with the Reset button |
| AC-11 | The timer is running | the User presses Start/Pause rapidly several times | the countdown never drops two seconds in one tick and never jumps backwards |
| AC-12 | A running session | the countdown reaches 0 | the timer stops (running = false, remaining = 0) and no further time elapses |

## Dependencies

- **Story 1 — Countdown display and session type** must land first: it owns the countdown/session-type state this story's controls drive and the `"use client"` component they live in.
- No external accounts, credentials, or third-party services.

## Technical constraints

- The component holding timer state and handlers must start with `"use client"` as its first line (browser APIs + React state + event handlers).
- Countdown timing is wall-clock based (`Date.now()` deltas), per architecture §5.1 — required for AC-6.
- Timer states are `idle | running | paused`; running state is boolean, remaining time is in seconds.
- Do not edit `globals.css`, `app/page.tsx` (stays a Server Component), or add palette colours.
- localStorage keys (`pomodoro:settings`, `pomodoro:daily`) are other stories' data; this story must not read or write them.
