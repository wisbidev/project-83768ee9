# Test Cases — Countdown display and session type

Module: `timer`
Plan item: 1. Countdown display and session type (feature/P1)
Requirement: TIMER-001 — Initial load state

## Scope and risk

This item is the first thing a user sees on page load; the product loses its
entire value if the page does not load a correct, visible Work session. Risk
assigned: **medium** — the item is read-only display (no data writes, no
permissions to deny), but a defect here makes the whole timer unusable, so
both acceptance criteria get dedicated cases.

Per the task instruction, only happy-path cases are included. The
corrupted-storage fallback listed under "Failure, boundary and permission
behaviour" in the SRS is out of scope for this happy-path set.

## Cases

**Scenario**: Initial load shows a ready Work session at 25:00
**Given**: the page loads with empty localStorage (no saved settings or counter)
**When**: the page finishes loading
**Then**: the session-type label reads `Work` and the countdown reads `25:00`

Traces to: TIMER-001 AC-1. Automated (DOM assertion).

**Scenario**: Countdown does not elapse before Start
**Given**: the page has loaded, showing `Work` at `25:00`, and no start has been pressed
**When**: 3 seconds pass
**Then**: the countdown still reads `25:00`

Traces to: TIMER-001 AC-2. Automated (DOM assertion after a wait).

**Scenario**: The session starts paused
**Given**: the page has just loaded with empty localStorage
**When**: the User inspects the timer controls
**Then**: the countdown reads `25:00` and the primary control reads `Start` (not `Pause`), i.e. the timer is not running

Traces to: TIMER-001 behaviour 2 ("The session starts paused; no time elapses
until the User starts it"). Automated (DOM assertion).

**Scenario**: Countdown is displayed in MM:SS format
**Given**: the page has loaded showing the Work session
**When**: the User reads the countdown
**Then**: the time is shown as `25:00` — minutes and seconds, each exactly two digits, separated by a colon (MM:SS)

Traces to: function description ("the remaining time as a visible MM:SS
countdown") and NFR Localisation ("time is always shown as `MM:SS`").
Automated (text-format assertion).

**Scenario**: Session type is visible on the main screen
**Given**: the page has loaded
**When**: the User looks at the timer card
**Then**: a session-type label reading exactly `Work` is displayed on the main screen

Traces to: function description ("shows the current session type") and
TIMER-001 AC-1. Automated (DOM assertion).

**Scenario**: One-page, clean and legible layout
**Given**: the page has loaded in a modern browser
**When**: the User views the page
**Then**: the countdown and session-type label are visible on a single page with no navigation and no scrolling required to see them, and the layout is clean and legible

Traces to: function description ("in a clean, legible one-page layout").
Manual — cleanliness and legibility are visual judgements that no tool can
assert.

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| Initial load shows a ready Work session at 25:00 | TIMER-001 AC-1 | Automated |
| Countdown does not elapse before Start | TIMER-001 AC-2 | Automated |
| The session starts paused | TIMER-001 behaviour 2 | Automated |
| Countdown is displayed in MM:SS format | Function description / NFR Localisation | Automated |
| Session type is visible on the main screen | Function description / TIMER-001 AC-1 | Automated |
| One-page, clean and legible layout | Function description | Manual (visual judgement) |

Every SRS acceptance criterion for TIMER-001 (AC-1, AC-2) has at least one
case. No negative, boundary or permission cases are required: the SRS names no
role to deny for this item, and error paths are out of scope per the task
instruction.
