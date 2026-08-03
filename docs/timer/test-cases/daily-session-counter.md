# Test Cases — Daily session counter

Module: `timer`
Plan item: 5. Daily session counter (feature/P2)
Requirement: TIMER-007 — Increment on completed work sessions; TIMER-008 — Persistence and daily reset

## Scope and risk

This item shows how many Work sessions were completed today, persisted in
`localStorage` under `pomodoro:daily` together with its date so it resets for a
new day. Risk assigned: **medium** — the counter is simple, but it writes data,
and its two failure modes (double counting across a reload, or failing to reset
for a new day) are silent and destroy trust in the count. The full increment,
reload, and new-day-reset paths are walked end-to-end, plus the "never changes"
guarantees for pause, reset, and break completions.

Per the task instruction, only happy-path cases are included. The "storage
unavailable", "corrupted value", and "rapid double-fire" behaviours listed
under "Failure, boundary and permission behaviour" in the SRS (and story AC-7)
are out of scope for this happy-path set. The midnight-rollover case
(TIMER-008 behaviour 3 / AC-3) is included because the function description
explicitly requires the counter to reset for a new day.

## Cases

**Scenario**: The counter chip shows 0 for a fresh day
**Given**: the page loads with empty localStorage (no `pomodoro:daily` entry)
**When**: the page finishes loading
**Then**: the top-bar chip shows the count `0` in `#dailyCount` next to the label `work sessions today`

Traces to: TIMER-007 behaviour 1 ("A counter in the top bar shows the number
of Work sessions completed today, labelled `N work sessions today`") and SRS
section 5 top-bar default state (count 0). Automated (DOM assertion on
`#dailyCount` and the label).

**Scenario**: A completed Work session increments the counter to 1
**Given**: the chip reads `0` and the timer is in a running Work session
**When**: the Work session's countdown reaches `00:00` and the session completes
**Then**: the chip reads `1` next to `work sessions today`

Traces to: TIMER-007 AC-1. Automated (DOM assertion on `#dailyCount` at
session end).

**Scenario**: Each completed Work session adds exactly one
**Given**: the chip reads `1` after one completed Work session and the timer is in a running Work session
**When**: that second Work session's countdown reaches `00:00`
**Then**: the chip reads `2` — never `1` (unchanged) and never `3` (doubled)

Traces to: TIMER-007 behaviour 2 ("The counter increments by exactly one each
time a Work session reaches zero"). Automated (DOM assertion on `#dailyCount`
after each completion).

**Scenario**: A completed Short Break leaves the counter unchanged
**Given**: the chip reads `3` and the timer is in a running Short Break
**When**: the Short Break ends and the countdown reaches `00:00`
**Then**: the chip still reads `3`

Traces to: TIMER-007 AC-2. Automated (DOM assertion on `#dailyCount` after the
break ends).

**Scenario**: A completed Long Break leaves the counter unchanged
**Given**: the chip reads `3` and the timer is in a running Long Break
**When**: the Long Break ends and the countdown reaches `00:00`
**Then**: the chip still reads `3`

Traces to: story AC-2 (extends TIMER-007 AC-2 — only a completed Work session
counts). Automated (DOM assertion on `#dailyCount` after the break ends).

**Scenario**: Resetting a running Work session does not change the counter
**Given**: the chip reads `2` and a Work session is running mid-countdown
**When**: the User presses Reset
**Then**: the chip still reads `2` and the countdown restarts at the full Work duration

Traces to: TIMER-007 AC-3. Automated (DOM assertion on `#dailyCount` after
Reset).

**Scenario**: Pausing a running Work session does not change the counter
**Given**: the chip reads `5` and a Work session is running
**When**: the User presses Pause
**Then**: the chip still reads `5` and the countdown is frozen

Traces to: TIMER-007 behaviour 3 ("Pausing, resetting, or skipping sessions
never changes the counter"). Automated (DOM assertion on `#dailyCount` after
Pause).

**Scenario**: The counter survives a reload with today's date — no double counting
**Given**: the chip reads `4` and `pomodoro:daily` holds `{ count: 4, date: today }` (local date `YYYY-M-D`)
**When**: the User reloads the page
**Then**: the chip reads `4` — not `0` (lost) and not `8` (double counted) — and the label reads `work sessions today`

Traces to: TIMER-008 AC-1. Automated (seed `localStorage`, reload, DOM
assertion on `#dailyCount`).

**Scenario**: A stored counter from yesterday loads as 0 for today
**Given**: `pomodoro:daily` holds a count from yesterday, e.g. `{ count: 6, date: <yesterday> }` where the stored date is not today
**When**: the page loads
**Then**: the chip reads `0` for today and `pomodoro:daily` is (re)written with today's date

Traces to: TIMER-008 AC-2 / behaviour 2 ("On load, if the stored date is not
today, the counter starts at 0 for today"). Automated (seed `localStorage`,
reload, DOM assertion on `#dailyCount` and storage read).

**Scenario**: A Work session completed after midnight starts a fresh day
**Given**: the page has been open since yesterday, the chip reads `6` with yesterday's date stored, and the local clock has passed midnight
**When**: the first Work session of the new day completes and its countdown reaches `00:00`
**Then**: the chip reads `1` — the counter resets to 0 for the new day and then increments to 1, never the previous total plus one (`7`) — and `pomodoro:daily.date` is today's date

Traces to: TIMER-008 AC-3 / behaviour 3 ("If the tab stays open past midnight,
the first Work session that completes after midnight starts a fresh day: the
counter resets to 0 and then increments to 1"). Automated (injected clock /
storage fixture; DOM assertion on `#dailyCount` and storage read at
completion).

**Scenario**: Reload restores the counter while the timer restarts at a full Work session
**Given**: the chip reads `4` with today's date stored and a Work session was running when the User left the page
**When**: the User reloads the page
**Then**: the chip reads `4`, while the timer restarts at a full `25:00` Work session, stopped (the restored counter and the restarted timer are independent)

Traces to: SRS section 7 assumption ("a reload restores saved durations and the
daily counter but restarts the timer at a full Work session, stopped").
Automated (seed storage, reload, DOM assertions on `#dailyCount` and the timer
display).

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| The counter chip shows 0 for a fresh day | TIMER-007 behaviour 1 / SRS §5 | Automated |
| A completed Work session increments the counter to 1 | TIMER-007 AC-1 | Automated |
| Each completed Work session adds exactly one | TIMER-007 behaviour 2 | Automated |
| A completed Short Break leaves the counter unchanged | TIMER-007 AC-2 | Automated |
| A completed Long Break leaves the counter unchanged | Story AC-2 / TIMER-007 AC-2 | Automated |
| Resetting a running Work session does not change the counter | TIMER-007 AC-3 | Automated |
| Pausing a running Work session does not change the counter | TIMER-007 behaviour 3 | Automated |
| The counter survives a reload with today's date — no double counting | TIMER-008 AC-1 | Automated |
| A stored counter from yesterday loads as 0 for today | TIMER-008 AC-2 | Automated |
| A Work session completed after midnight starts a fresh day | TIMER-008 AC-3 | Automated |
| Reload restores the counter while the timer restarts at a full Work session | SRS §7 | Automated |

Every SRS acceptance criterion for TIMER-007 (AC-1–AC-3) and TIMER-008
(AC-1–AC-3) has at least one case, and the function's own acceptance — the
counter increments per completed Work session and survives a reload without
double counting — is covered directly. No manual cases are needed: every
assertion observes the DOM or `localStorage`. The SRS failure behaviours
(storage unavailable, corrupted value, rapid double-fire) and story AC-7 are
excluded per the task instruction — they are error/edge cases, and the
happy-path set is complete without them.
