# Test Cases — Start, pause and reset controls

Module: `timer`
Plan item: 2. Start, pause and reset controls (feature/P1)
Requirements: TIMER-002 — Start and pause; TIMER-003 — Reset

## Scope and risk

This item is the heart of the product: the countdown must tick exactly one
second per real second, freeze and resume without losing time, and reset to
the correct full duration — all while staying accurate in a background tab and
reachable by keyboard. Risk assigned: **high** — incorrect ticking is the one
defect that makes the timer worthless, and wall-clock derivation plus keyboard
shortcuts (Space, R) are easy to get subtly wrong.

Per the task instruction, only happy-path cases are included. The boundary
cases listed under "Failure, boundary and permission behaviour" in the SRS
(reset at full duration is a no-op; rapid start/pause never double-counts) are
out of scope for this happy-path set.

## Cases

**Scenario**: Start begins the countdown
**Given**: a fresh Work session at `25:00`, paused
**When**: the User presses Start and waits 65 seconds
**Then**: the countdown reads `23:55`

Traces to: TIMER-002 AC-1 and behaviour 1. Automated (DOM assertion after a
wait).

**Scenario**: The primary control reads Pause while the timer is running
**Given**: a paused fresh Work session at `25:00`
**When**: the User presses Start
**Then**: the primary control reads `Pause` and the countdown begins decreasing

Traces to: TIMER-002 behaviour 2. Automated (DOM assertion).

**Scenario**: Pause freezes the countdown
**Given**: a Work session running at `12:30`
**When**: the User presses Pause
**Then**: the countdown freezes at `12:30`, still reads `12:30` after the User
waits 3 more seconds, and the primary control reads `Start`

Traces to: TIMER-002 AC-2 and behaviour 2. Automated (DOM assertion after a
wait).

**Scenario**: Start resumes from the frozen value
**Given**: the timer paused at `12:30`
**When**: the User presses Start
**Then**: the countdown resumes from `12:30` and continues decreasing from there

Traces to: TIMER-002 AC-3 and behaviour 3. Automated (DOM assertion).

**Scenario**: Space toggles start/pause like the button
**Given**: no input field or button has focus and the timer is paused at `25:00`
**When**: the User presses `Space`
**Then**: the timer starts, and pressing `Space` again pauses it — toggling
exactly as with the primary button

Traces to: TIMER-002 AC-4 and behaviour 5. Automated (keyboard event + DOM
assertion).

**Scenario**: Countdown stays accurate when the tab is in the background
**Given**: the timer is running at `25:00`
**When**: the User hides the tab for 10 seconds and returns
**Then**: the countdown has decreased by exactly 10 seconds (no drift from
missed ticks)

Traces to: TIMER-002 AC-5 and behaviour 4. Automated (wall-clock-derived value;
DOM assertion on return).

**Scenario**: Reset stops the countdown and restores the full duration
**Given**: a running Work session at `10:15`
**When**: the User presses Reset
**Then**: the countdown stops and reads `25:00`, and the primary control reads
`Start` (paused)

Traces to: TIMER-003 AC-1 and behaviour 1. Automated (DOM assertion).

**Scenario**: Reset restores the current session's own duration and keeps its label
**Given**: a Short Break session with a saved 5-minute duration, running at `02:00`
**When**: the User presses Reset
**Then**: the countdown reads `05:00`, paused, and the session-type label still
reads `Short Break`

Traces to: TIMER-003 AC-2 and behaviour 2. Automated (DOM assertion).

**Scenario**: Reset leaves the session type, daily counter and cycle position untouched
**Given**: a Work session running at session 2 of 4 in the current cycle, with
the daily counter reading 2
**When**: the User presses Reset
**Then**: the session type stays `Work`, the daily counter still reads 2, and
the cycle dots still show session 2 of 4

Traces to: TIMER-003 behaviour 2. Automated (DOM assertion).

**Scenario**: The R key performs the same reset
**Given**: a running Work session at `10:15`
**When**: the User presses `R`
**Then**: the countdown stops and reads `25:00`, paused — the same result as
pressing Reset

Traces to: TIMER-003 behaviour 3. Automated (keyboard event + DOM assertion).

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| Start begins the countdown | TIMER-002 AC-1, behaviour 1 | Automated |
| The primary control reads Pause while running | TIMER-002 behaviour 2 | Automated |
| Pause freezes the countdown | TIMER-002 AC-2 | Automated |
| Start resumes from the frozen value | TIMER-002 AC-3, behaviour 3 | Automated |
| Space toggles start/pause like the button | TIMER-002 AC-4, behaviour 5 | Automated |
| Countdown stays accurate in a background tab | TIMER-002 AC-5, behaviour 4 | Automated |
| Reset stops the countdown and restores full duration | TIMER-003 AC-1, behaviour 1 | Automated |
| Reset restores the current session's own duration and label | TIMER-003 AC-2, behaviour 2 | Automated |
| Reset leaves type, counter and cycle untouched | TIMER-003 behaviour 2 | Automated |
| The R key performs the same reset | TIMER-003 behaviour 3 | Automated |

Every SRS acceptance criterion for TIMER-002 (AC-1…AC-5) and TIMER-003
(AC-1, AC-2) has at least one case. No negative or permission cases are
required: the SRS names a single actor (User) with no roles to deny, and the
failure/boundary paths are out of scope per the task instruction.
