# Test Cases — Session cycle with long break

Module: `timer`
Plan item: 3. Session cycle with long break (feature/P1)
Requirement: TIMER-004 — Automatic cycle order

## Scope and risk

This item is the heart of the Pomodoro flow: the timer must advance by itself
through Work, Short Break, and (after every fourth Work session) Long Break,
without the User ever setting the next session. Risk assigned: **medium-high**
— a wrong cycle order silently breaks the product's core promise, and the
four-session boundary is exactly where off-by-one defects hide, so the full
cycle is walked end-to-end in addition to each acceptance criterion.

Per the task instruction, only happy-path cases are included. The "break ends
while paused" and "settings changed mid-cycle" behaviours listed under
"Failure, boundary and permission behaviour" in the SRS are out of scope for
this happy-path set.

## Cases

**Scenario**: A completed Work session advances to a Short Break
**Given**: the timer is in a running Work session (default 25-minute duration)
**When**: the Work session ends and the countdown reaches `00:00`
**Then**: the session-type label reads `Short Break` and the countdown shows the short-break duration (`05:00` with defaults)

Traces to: TIMER-004 AC-1. Automated (DOM assertion at session end).

**Scenario**: A completed Short Break returns to Work
**Given**: the timer is in a running Short Break session
**When**: the Short Break ends and the countdown reaches `00:00`
**Then**: the session-type label reads `Work` and the countdown shows the work duration

Traces to: TIMER-004 AC-4. Automated (DOM assertion at session end).

**Scenario**: The fourth completed Work session advances to a Long Break
**Given**: the User has completed Work sessions 1–3 in the current cycle (each followed by a Short Break), and the timer is in the 4th Work session of the cycle
**When**: the 4th Work session ends and the countdown reaches `00:00`
**Then**: the session-type label reads `Long Break` and the countdown shows the long-break duration (`15:00` with defaults)

Traces to: TIMER-004 AC-2. Automated (DOM assertion at session end).

**Scenario**: A completed Long Break restarts the cycle at Work
**Given**: the timer is in a running Long Break session at cycle position 4 of 4
**When**: the Long Break ends and the countdown reaches `00:00`
**Then**: the session-type label reads `Work`, the countdown shows the work duration, and the cycle dots reset to session 1 of 4

Traces to: TIMER-004 AC-3. Automated (DOM assertion at session end).

**Scenario**: Full cycle order — work, three short breaks, work, long break, restart
**Given**: the User runs the timer from a fresh cycle without any manual intervention
**When**: the User completes Work sessions and breaks continuously until after the first Long Break of the cycle ends
**Then**: the sequence of session-type labels is `Work` → `Short Break` → `Work` → `Short Break` → `Work` → `Short Break` → `Work` → `Long Break` → `Work` (four Work sessions, a Short Break after each of the first three, a Long Break after the fourth, then the cycle restarts at Work)

Traces to: function description ("the cycle order is work → short break (×3)
→ work → long break, and the session type label updates on each advance") and
TIMER-004 behaviour 1–4. Automated (recorded label sequence over the full
cycle).

**Scenario**: Each advanced session starts paused at its full duration
**Given**: a session has just ended and the timer has advanced to the next session
**When**: the User inspects the new session without pressing Start
**Then**: the new session is paused (the primary control reads `Start`, not `Pause`) at its full duration, and no time elapses until the User starts it

Traces to: TIMER-004 behaviour 5 ("the new session starts paused at its full
duration"). Automated (DOM assertion after the advance).

**Scenario**: The session-type label and its colour update immediately on each advance
**Given**: the timer has just advanced from one session type to the next (e.g. Work → Short Break, then Short Break → Work, and Work → Long Break after the fourth session)
**When**: the User reads the timer card at each transition
**Then**: the session-type label and the pill/ring colour match the new type on every advance — tomato for Work, green for Short Break, blue for Long Break — with no stale label or colour from the previous session

Traces to: TIMER-004 behaviour 5 ("the session-type label and its colour
update immediately") and SRS section 5 colour palette. Automated (style
assertion at each transition; colour values `#E4572E` / `#2F9E77` / `#3B6FE0`).

**Scenario**: Cycle dots show the session position and fill per completed Work session
**Given**: the timer is mid-cycle, having completed 2 Work sessions (at positions 1 and 2 of 4), and the cycle-dot row is visible
**When**: the User reads the cycle-dot row
**Then**: the row shows four dots labelled `Session 3 of 4`, with the first two dots filled and the remaining two empty

Traces to: TIMER-004 behaviour 6 ("The cycle position is shown as a row of
four dots, labelled `Session N of 4`; completed sessions in the current cycle
are filled"). Automated (DOM assertion on dot state and label).

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| A completed Work session advances to a Short Break | TIMER-004 AC-1 | Automated |
| A completed Short Break returns to Work | TIMER-004 AC-4 | Automated |
| The fourth completed Work session advances to a Long Break | TIMER-004 AC-2 | Automated |
| A completed Long Break restarts the cycle at Work | TIMER-004 AC-3 | Automated |
| Full cycle order — work, three short breaks, work, long break, restart | Function description / TIMER-004 behaviour 1–4 | Automated |
| Each advanced session starts paused at its full duration | TIMER-004 behaviour 5 | Automated |
| The session-type label and its colour update immediately on each advance | TIMER-004 behaviour 5 / SRS section 5 | Automated |
| Cycle dots show the session position and fill per completed Work session | TIMER-004 behaviour 6 | Automated |

Every SRS acceptance criterion for TIMER-004 (AC-1 through AC-4) has at least
one case, and the full cycle order from the function description is walked
end-to-end. No negative, boundary or permission cases are required beyond the
happy path: the SRS names no role to deny for this item, and the "break ends
while paused" and "settings changed mid-cycle" behaviours are out of scope per
the task instruction.
