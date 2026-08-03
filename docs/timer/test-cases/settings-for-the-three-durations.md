# Test Cases — Settings for the three durations

Module: `timer`
Plan item: 6. Settings for the three durations (feature/P2)
Requirement: TIMER-009 — Change and save durations; TIMER-010 — Persistence of settings

## Scope and risk

This item lets the User change the Work, Short Break and Long Break durations
in the Settings card and have them persist: saving stores `{ work, short,
long }` under the single `localStorage` key `pomodoro:settings`, restarts the
current session stopped at the new duration of its own type, and every future
session uses the new values. Risk assigned: **medium** — the settings write
data and their acceptance (the timer actually uses the updated values, and they
survive a reload) spans the save, restart, cycle and reload paths, so each of
those is walked end-to-end.

Per the task instruction, only happy-path cases are included. The clamping
acceptance criteria (TIMER-009 AC-4, AC-5) and the out-of-range stored value
(TIMER-010 AC-2) are included because they are explicit acceptance criteria in
the SRS, and the save-mid-countdown restart is included because the function's
own acceptance — "changing a duration updates the running timer" — explicitly
requires the current session to restart. The remaining "Failure, boundary and
permission behaviour" rows (storage unavailable, corrupted stored JSON, empty
input treated as 0) and story AC-11 / AC-12 are error/edge cases and are out of
scope for this happy-path set.

## Cases

**Scenario**: The Settings card prefills from the defaults on a fresh page
**Given**: the page loads with empty localStorage (no `pomodoro:settings` entry)
**When**: the page finishes loading
**Then**: the Work input (`#inpWork`) reads `25`, the Short break input (`#inpShort`) reads `5`, and the Long break input (`#inpLong`) reads `15`

Traces to: TIMER-009 behaviour 1 ("prefilled from saved values or the defaults
`25 / 5 / 15`") and design `design/index.html` default input values.
Automated (DOM assertion on the three inputs after load).

**Scenario**: Saving Work = 50 restarts the current session stopped at 50:00
**Given**: a fresh page with default settings and the timer paused at a Work session (`25:00`)
**When**: the User changes the Work input to `50` and presses Save settings
**Then**: the current session restarts stopped (the primary control reads `Start`), the countdown reads `50:00`, the session-type label reads `Work`, and the toast shows `Settings saved — applied to the current session.`

Traces to: TIMER-009 AC-1 and behaviour 2; story AC-1. Automated (DOM
assertion on the timer display, primary control, session-type label and toast
after Save settings).

**Scenario**: Saving mid-countdown stops the running session and restarts it at the new duration
**Given**: the timer is running a Work session at `10:15` and the User changes the Work input to `50`
**When**: the User presses Save settings
**Then**: the countdown stops and restarts at `50:00`, paused — it never continues mid-flight from `10:15`

Traces to: story AC-4 and SRS TIMER-009 failure behaviour "Saving
mid-countdown" ("The running session is stopped and restarted at the new Work
duration (the current session always restarts, never mid-flight)"); function
acceptance "changing a duration updates the running timer". Automated (DOM
assertion on the countdown and primary control after Save settings).

**Scenario**: The saved Work duration loads into the input and the timer after a reload
**Given**: Work = 50 has been saved (the page is reloaded)
**When**: the page finishes loading
**Then**: the Work input (`#inpWork`) reads `50` and the timer shows `50:00` labelled `Work`, stopped

Traces to: TIMER-009 AC-2 and behaviour 1; story AC-2. Automated (seed
`pomodoro:settings`, reload, DOM assertion on the input and the timer
display).

**Scenario**: All three saved durations survive a reload
**Given**: `pomodoro:settings` holds `{ work: 30, short: 10, long: 20 }` and the User reloads the page
**When**: the page finishes loading
**Then**: the three inputs read `30 / 10 / 20` and the current timer shows the saved Work duration `30:00`

Traces to: TIMER-010 AC-1 and behaviour 1; story AC-3. Automated (seed
`localStorage`, reload, DOM assertion on the three inputs and the timer
display).

**Scenario**: The saved Short Break duration feeds the cycle when a Work session completes
**Given**: a Short Break of 5 minutes is saved and the timer is in a Work session
**When**: the Work session completes and its countdown reaches `00:00`
**Then**: the timer advances to a Short Break whose countdown reads `05:00`, using the saved duration

Traces to: TIMER-009 AC-3 and behaviour 2 ("every future session uses the new
durations"); story AC-7. Automated (seed `pomodoro:settings`, run a Work
session to completion, DOM assertion on the break countdown).

**Scenario**: A saved Long Break duration applies to the long break after the fourth Work session
**Given**: a Long Break of 20 minutes is saved and the User has completed Work sessions 1–3 in the current cycle
**When**: the 4th Work session of the cycle completes and its countdown reaches `00:00`
**Then**: the timer advances to a Long Break whose countdown reads `20:00`, using the saved duration

Traces to: TIMER-009 behaviour 2 ("every future session uses the new
durations") applied to the long break of TIMER-004 behaviour 3. Automated
(seed `pomodoro:settings`, complete four Work sessions, DOM assertion on the
Long Break countdown).

**Scenario**: Work = 0 is clamped up to the minimum of 1 minute
**Given**: the timer is paused at a Work session and the Work input holds `0`
**When**: the User presses Save settings
**Then**: the Work input (`#inpWork`) and the timer both show `01:00` (the value below the lower bound is clamped to 1)

Traces to: TIMER-009 AC-4 and behaviour 5 ("below 1 → 1"); story AC-5.
Automated (set input, save, DOM assertion on the input and the timer).

**Scenario**: Short Break = 120 is clamped down to the maximum of 60
**Given**: the Settings card is visible and the Short break input holds `120`
**When**: the User presses Save settings
**Then**: the Short break input (`#inpShort`) reads `60` and a future Short Break session uses `60` minutes (the value above the max is clamped to 60)

Traces to: TIMER-009 AC-5 and behaviour 5 ("above max → max"); story AC-6.
Automated (set input, save, DOM assertion on the input).

**Scenario**: Reset to defaults restores 25 / 5 / 15, applies them and persists
**Given**: saved settings exist (e.g. Work = 50) and the timer is stopped at `50:00` labelled `Work`
**When**: the User presses Reset to defaults
**Then**: all three inputs read `25 / 5 / 15`, the current session restarts stopped at its default duration `25:00`, and after a reload the inputs still read `25 / 5 / 15` (the defaults are persisted)

Traces to: TIMER-009 AC-6 and behaviour 3; story AC-8 (values persist).
Automated (press Reset to defaults, DOM assertion on inputs and timer; reload
and re-assert the inputs).

**Scenario**: Enter inside a duration input saves exactly like the Save button
**Given**: the Work input is focused and holds `50`, and the timer is paused at `25:00` labelled `Work`
**When**: the User presses `Enter`
**Then**: the settings save exactly as with the Save button — the current session restarts stopped at `50:00`, the toast confirms the save, and `pomodoro:settings.work` is `50`

Traces to: TIMER-009 AC-7 and behaviour 4; story AC-9. Automated (keyboard
event in the input, DOM assertion on the timer and toast, storage read).

**Scenario**: An out-of-range stored Work value falls back to the default 25
**Given**: `pomodoro:settings` holds `{ work: 999, short: 5, long: 15 }` and the page loads
**When**: the page finishes loading
**Then**: the Work input (`#inpWork`) reads `25` (the out-of-range value falls back to the default) and the page renders normally

Traces to: TIMER-010 AC-2 and behaviour 2 ("If stored values are missing,
non-numeric, or outside the valid range, the defaults `25 / 5 / 15` are used
for the invalid entries"); story AC-10. Automated (seed `localStorage`,
reload, DOM assertion on the input).

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| The Settings card prefills from the defaults on a fresh page | TIMER-009 behaviour 1 | Automated |
| Saving Work = 50 restarts the current session stopped at 50:00 | TIMER-009 AC-1, behaviour 2 | Automated |
| Saving mid-countdown stops the running session and restarts it at the new duration | Story AC-4 / SRS "Saving mid-countdown" / function acceptance | Automated |
| The saved Work duration loads into the input and the timer after a reload | TIMER-009 AC-2 | Automated |
| All three saved durations survive a reload | TIMER-010 AC-1 | Automated |
| The saved Short Break duration feeds the cycle when a Work session completes | TIMER-009 AC-3 | Automated |
| A saved Long Break duration applies to the long break after the fourth Work session | TIMER-009 behaviour 2 + TIMER-004 behaviour 3 | Automated |
| Work = 0 is clamped up to the minimum of 1 minute | TIMER-009 AC-4 | Automated |
| Short Break = 120 is clamped down to the maximum of 60 | TIMER-009 AC-5 | Automated |
| Reset to defaults restores 25 / 5 / 15, applies them and persists | TIMER-009 AC-6 | Automated |
| Enter inside a duration input saves exactly like the Save button | TIMER-009 AC-7 | Automated |
| An out-of-range stored Work value falls back to the default 25 | TIMER-010 AC-2 | Automated |

Every SRS acceptance criterion for TIMER-009 (AC-1 through AC-7) and TIMER-010
(AC-1, AC-2) has at least one case, and the function's own acceptance —
changing a duration updates the running timer and the new values persist across
reloads — is covered directly. No manual cases are needed: every assertion
observes the DOM, `localStorage`, or a keyboard event. No permission cases are
required: the SRS names a single actor (User) with no roles to deny. The
remaining failure/edge behaviours (storage unavailable, corrupted stored JSON,
empty input treated as 0 — story AC-11 / AC-12) are excluded per the task
instruction; they are error cases, and the happy-path set is complete without
them.
