# SRS — Pomodoro Timer

Module: `timer`
Last updated: 2026-06-04
Design: [View the approved design](http://localhost:8080/design/83768ee9-ae1f-41bf-ab6c-a7f9eaf069f7)
Design system: `design/design-system.md`

> One file per module, at `docs/{module}/SRS.md`. It covers only the functions
> that belong to this module. Never write `docs/SRS.md`.

## 1. Purpose

A single-page Pomodoro Timer that runs entirely in the browser. It helps a
person work in focused 25-minute blocks with short and long breaks between
them, and it tracks how many work sessions they complete per day. There is no
backend, no account, and no database: everything runs client-side, and the
product loses its entire value if the page does not load and tick correctly in
any modern browser.

## 2. Actors

A single actor uses this module; there are no permissions to differentiate.

| Actor | Who they are | What they may do in this module |
|---|---|---|
| User | Anyone who opens the page in a browser | Start, pause and reset the timer; change the three durations; see the session type, countdown, cycle position and daily counter; grant or deny browser notifications |

## 3. Scope

**In scope** — the functions specified below, by their plan titles:

- Countdown display and session type
- Start, pause and reset controls
- Session cycle with long break
- End-of-session sound and notification
- Daily session counter
- Settings for the three durations

**Out of scope** — name what a reader would reasonably expect here and say
where it lives instead:

- Accounts, sign-in, sync, or a backend — deliberately not built; the product is a static site by design.
- Persistent work/break history beyond today's count — deliberately not built; only the daily counter and settings are stored.
- Task lists, tags, or per-task timers — deliberately not built; the timer tracks sessions, not tasks.

## 4. Functional requirements

One subsection per function. Every requirement carries a stable id `TIMER-NNN`
— ids are permanent: never renumber, never reuse. When a requirement is
dropped, mark it `(withdrawn)` and keep the id.

### 4.1 Countdown display and session type

**Requirement TIMER-001 — Initial load state**

*As a* User, *I want to* open the page and immediately see a ready-to-start
Work session, *so that* I can begin working without any setup.

Behaviour:

1. On first load, with no saved settings, the page shows the session type
   `Work` and the time `25:00`.
2. The session starts paused; no time elapses until the User starts it.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The page loads with empty localStorage | the page finishes loading | the session type reads `Work` and the countdown reads `25:00` |
| AC-2 | The page has loaded and no start has been pressed | 3 seconds pass | the countdown still reads `25:00` |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Corrupted storage | localStorage contains unreadable data | The page loads with defaults (`25 / 5 / 15`); it never crashes on load |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Current session type | enum (work / short / long) | yes | Starts as `work` |
| Remaining time | seconds | yes | Starts at the work duration × 60 |

### 4.2 Start, pause and reset controls

**Requirement TIMER-002 — Start and pause**

*As a* User, *I want to* start and pause the countdown, *so that* I control
when time is counted.

Behaviour:

1. Pressing Start begins the countdown: the remaining time decreases by one
   second per second of real time.
2. While running, the primary button reads `Pause`; pressing it freezes the
   countdown at the current remaining time.
3. Pressing Start again resumes from the frozen value.
4. The countdown stays accurate when the tab is in the background; it is
   derived from the wall clock, not from counting ticks.
5. The keyboard shortcut `Space` toggles start/pause when no input field or
   button has focus.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A fresh Work session at `25:00`, paused | the User presses Start and waits 65 seconds | the countdown reads `23:55` |
| AC-2 | The timer is running | the User presses Pause | the countdown freezes and stays at the same value |
| AC-3 | The timer is paused at `12:30` | the User presses Start | the countdown resumes from `12:30` |
| AC-4 | No input or button has focus | the User presses `Space` | the timer toggles exactly as with the button |
| AC-5 | The timer is running | the User hides the tab for 10 seconds and returns | the countdown has decreased by 10 seconds (no drift) |

**Requirement TIMER-003 — Reset**

*As a* User, *I want to* reset the current session, *so that* I can restart it
at full duration whenever I like.

Behaviour:

1. Pressing Reset stops the countdown and restores the current session to its
   full duration.
2. Reset never changes the session type and never touches the daily counter or
   cycle position.
3. The keyboard shortcut `R` performs the same action.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A running Work session at `10:15` | the User presses Reset | the countdown stops and reads `25:00`, paused |
| AC-2 | A Short Break session with a saved 5-minute duration | the User presses Reset | the countdown reads `05:00`, still labelled `Short Break` |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Reset at full duration | Session is paused at its full duration | Reset is a no-op; nothing changes |
| Repeated start/pause | User presses Start/Pause rapidly | The timer never counts two seconds in one tick and never jumps backwards |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Running state | boolean | yes | false when paused or finished |
| Remaining time | seconds | yes | Freezes on pause; returns to total on reset |

### 4.3 Session cycle with long break

**Requirement TIMER-004 — Automatic cycle order**

*As a* User, *I want to* the timer to advance automatically through the
work/break cycle, *so that* I never have to set the next session myself.

Behaviour:

1. When a Work session ends, the timer advances to a Short Break.
2. When a Short Break ends, the timer advances to Work.
3. After every fourth completed Work session the timer advances to a Long
   Break instead of a Short Break.
4. After the Long Break ends, the cycle restarts: the next session is Work and
   the four-session counter resets.
5. On each advance the session-type label and its colour update immediately,
   and the new session starts paused at its full duration.
6. The cycle position is shown as a row of four dots, labelled
   `Session N of 4`; completed sessions in the current cycle are filled.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The timer is in Work and it completes | the session ends | the label reads `Short Break` and the countdown shows the short-break duration |
| AC-2 | The timer has completed Work sessions 1–3 in a cycle | the 4th Work session ends | the label reads `Long Break` and the countdown shows the long-break duration |
| AC-3 | A Long Break is running | it ends | the label reads `Work`, the countdown shows the work duration, and the dots reset to session 1 of 4 |
| AC-4 | A Short Break is running | it ends | the label reads `Work` |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Break ends while paused | User pauses a break; it never reaches 0 | No advance happens until the countdown actually reaches zero |
| Settings changed mid-cycle | User changes durations between sessions | The cycle order and dot state are unchanged; only durations apply to future sessions |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Cycle position | integer 0–4 | yes | Number of completed Work sessions in the current cycle; 0 after a long break |
| Current session type | enum (work / short / long) | yes | Advanced automatically at session end |

### 4.4 End-of-session sound and notification

**Requirement TIMER-005 — Audible chime at session end**

*As a* User, *I want to* hear a sound when a session ends, *so that* I notice
the transition even without watching the screen.

Behaviour:

1. When any session (Work, Short Break or Long Break) reaches zero, the
   browser plays a short chime.
2. The chime plays even when the tab is in the background.
3. Audio is created or resumed only from within a user gesture (start/pause),
   so browsers' autoplay policies do not block it.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A running session with 3 seconds left | the countdown reaches 0 | an audible chime is played |
| AC-2 | The tab is in the background | a session ends | the chime still plays |

**Requirement TIMER-006 — Browser notification at session end**

*As a* User, *I want to* receive a browser notification when a session ends,
*so that* I notice the transition when the tab is not visible.

Behaviour:

1. When a session ends and notification permission is granted, the browser
   shows a notification naming the session that finished and the session that
   follows (e.g. "Work finished — time for a short break.").
2. Permission is requested from the User the first time they start the timer,
   and never at page load.
3. If the browser does not support notifications, or permission is denied, the
   page continues working normally with sound only, and shows a short status
   line explaining that notifications are blocked.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | Notification permission is granted | a Work session ends | a notification appears naming the finished and the next session |
| AC-2 | Notification permission is default | the User presses Start for the first time | the browser asks for permission |
| AC-3 | Notification permission is denied | a session ends | no notification appears, a status line explains sound-only mode, and the timer keeps working |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| API unavailable | `Notification` is not supported | No notification and no error; sound still plays |
| Permission default at session end | User never started the timer | No notification is shown; permission was only requested on Start |
| Audio unavailable | `AudioContext` cannot be created | The session ends silently but the cycle, counter and notifications still work |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Notification permission | browser-managed | no | Read at session end; requested on first Start |
| Audio context | browser-managed | no | Created/resumed within a user gesture |

### 4.5 Daily session counter

**Requirement TIMER-007 — Increment on completed work sessions**

*As a* User, *I want to* see how many Work sessions I have completed today,
*so that* I can track my daily output.

Behaviour:

1. A counter in the top bar shows the number of Work sessions completed today,
   labelled `N work sessions today`.
2. The counter increments by exactly one each time a Work session reaches zero.
3. Pausing, resetting, or skipping sessions never changes the counter; a Work
   session counts only when it actually completes.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The counter reads 0 | a Work session completes | the counter reads 1 |
| AC-2 | The counter reads 3 | a Short Break completes | the counter still reads 3 |
| AC-3 | The counter reads 2 | the User resets a Work session mid-countdown | the counter still reads 2 |

**Requirement TIMER-008 — Persistence and daily reset**

*As a* User, *I want to* the counter to survive a page reload and reset for a
new day, *so that* it reflects today and only today.

Behaviour:

1. The counter and the date it belongs to are stored in `localStorage`.
2. On load, if the stored date is not today, the counter starts at 0 for today.
3. If the tab stays open past midnight, the first Work session that completes
   after midnight starts a fresh day: the counter resets to 0 and then
   increments to 1.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The counter reads 4 with today's date stored | the User reloads the page | the counter reads 4, not 0 and not 8 |
| AC-2 | The stored counter is from yesterday | the page loads | the counter reads 0 for today |
| AC-3 | The page has been open since yesterday | a Work session completes after midnight | the counter reads 1 (reset then incremented), not the previous total plus one |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Storage unavailable | `localStorage` throws (private mode, quota) | The page works and the counter shows 0; it does not survive a reload, and no error is surfaced |
| Corrupted value | Stored count is not a number, or the date is malformed | Treated as no saved data; counter starts at 0 |
| Rapid double-fire | Session end fires twice | The counter increments exactly once per completed Work session |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Daily count | integer ≥ 0 | yes | Increments by 1 per completed Work session |
| Date | local date string (YYYY-M-D) | yes | Compared against today on load and at completion |

### 4.6 Settings for the three durations

**Requirement TIMER-009 — Change and save durations**

*As a* User, *I want to* change the Work, Short Break and Long Break durations,
*so that* the timer fits my preferred schedule.

Behaviour:

1. The Settings card shows three numeric inputs, in minutes: Work, Short Break
   and Long Break, prefilled from saved values or the defaults `25 / 5 / 15`.
2. Pressing Save Settings stores the values and applies them: the current
   session restarts at the new duration of its own type, stopped, and every
   future session uses the new durations.
3. Pressing Reset to defaults restores `25 / 5 / 15`, applies them the same
   way, and updates the inputs.
4. Pressing `Enter` inside any duration input saves, same as the Save button.
5. Valid ranges: Work and Long Break 1–120 whole minutes; Short Break 1–60
   whole minutes. On save, any out-of-range or non-numeric value is clamped to
   the nearest valid bound (below 1 → 1, above max → max).

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A fresh page with defaults | the User saves Work = 50 | the current session restarts stopped at `50:00`, labelled `Work` |
| AC-2 | Work saved as 50 | the User reloads the page | the Work input reads 50 and the timer shows `50:00` |
| AC-3 | A 5-minute Short Break is saved | a Work session completes | the timer advances to a Short Break of `05:00` |
| AC-4 | The User enters Work = 0 and saves | saving completes | the Work input and timer show `01:00` (clamped to 1) |
| AC-5 | The User enters Short Break = 120 and saves | saving completes | the Short Break value is `60` (clamped to the max) |
| AC-6 | The User presses Reset to defaults | the action completes | all inputs read `25 / 5 / 15` and the current session restarts at its default duration |
| AC-7 | A duration input is focused | the User presses `Enter` | the settings save exactly as with the Save button |

**Requirement TIMER-010 — Persistence of settings**

*As a* User, *I want to* my durations to survive a reload, *so that* I set them
once.

Behaviour:

1. Saved durations are stored in `localStorage` under one key and loaded on
   page start.
2. If stored values are missing, non-numeric, or outside the valid range, the
   defaults `25 / 5 / 15` are used for the invalid entries.

**Acceptance criteria**

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | Work = 30, Short = 10, Long = 20 saved | the User reloads the page | the inputs and the current timer show those values |
| AC-2 | localStorage holds Work = 999 | the page loads | Work falls back to the default 25 |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Storage unavailable | `localStorage` throws on save | A confirmation toast still appears but the values are not persisted; the app never crashes |
| Corrupted stored JSON | The settings key is unreadable | Defaults are used |
| Saving mid-countdown | A Work session is running when Save is pressed | The running session is stopped and restarted at the new Work duration (the current session always restarts, never mid-flight) |
| Empty input | A duration field is empty on save | Treated as 0 and clamped to the minimum (1 minute) |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| Work duration | minutes, integer 1–120 | yes | Default 25 |
| Short break duration | minutes, integer 1–60 | yes | Default 5 |
| Long break duration | minutes, integer 1–120 | yes | Default 15 |

## 5. Screens

The design is the source of truth for appearance; this section maps functions
onto it so nothing in the design is unaccounted for and nothing specified here
is missing from the design. Single-page app: the sections stack vertically on
one page.

| Screen | Section in the design | Functions it serves | States that must exist |
|---|---|---|---|
| Top bar | Brand + daily counter chip | TIMER-007, TIMER-008 | default (count 0), counted (N > 0) |
| Timer card | Session-type pill, progress ring with MM:SS, Start/Pause + Reset buttons, 4 cycle dots | TIMER-001, TIMER-002, TIMER-003, TIMER-004 | work, short break, long break; running; paused; reset |
| Settings card | Work / Short break / Long break inputs, Reset to defaults, Save settings | TIMER-009, TIMER-010 | default values, saved values, clamped values |
| Toast | Bottom-centre feedback message | TIMER-004, TIMER-006, TIMER-009 | visible, hidden |
| Footer | Keyboard hint (Space / R) | TIMER-002, TIMER-003 | static |

Colour palette from the approved design: `#E4572E` primary tomato (Work,
brand, counter), `#FBF6EF` warm cream background, `#2B2B33` ink (text and the
running primary button), `#2F9E77` green (Short Break), `#3B6FE0` blue (Long
Break). Session type drives the pill and ring colour: tomato for Work, green
for Short Break, blue for Long Break.

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | The page is interactive within 2 s on a typical connection; the countdown display updates within 1 s and the timer drifts by no more than 1 s over a full session |
| Accessibility | All controls keyboard-reachable with visible focus; icon buttons and duration inputs have accessible names; text contrast ≥ 4.5:1; `prefers-reduced-motion` disables the decorative animations |
| Responsive | Works at 320 px and up with no horizontal page scroll; the three settings fields stack on narrow screens |
| Localisation | All copy is in English; time is always shown as `MM:SS` |
| Privacy | No personal data leaves the browser; the only storage is `localStorage` (durations and the daily counter with its date); no network requests and no analytics |
| Reliability | The app must keep running when the tab is in the background, with countdown and session end derived from the wall clock |

## 7. Dependencies and assumptions

- **Depends on:** browser APIs only — `localStorage`, `Notification`,
  `AudioContext`, `setInterval`/timestamps. No backend, no third-party
  services, no network dependency at runtime.
- **Assumption:** the running timer does not survive a reload — a reload
  restores saved durations and the daily counter but restarts the timer at a
  full Work session, stopped. If the stakeholder wants a reload to resume the
  in-flight session, that is a scope change.
- **Assumption:** durations are whole minutes only. If the stakeholder wants
  seconds-level precision, that is a scope change.

| Open question | Proposed default | Who decides |
|---|---|---|
| Should the notification also request permission when the tab is visible? | No — request on first Start regardless of visibility | Stakeholder |
| What happens to the in-flight session when settings are saved? | It restarts at the new duration, stopped | Stakeholder |

## 8. Traceability

Every plan item in this module appears exactly once, and every requirement id
traces to a test case. A gap in this table is a gap in the build.

| Plan item | Requirement ids | Test cases |
|---|---|---|
| Countdown display and session type | TIMER-001 | `test-cases/countdown-display-and-session-type.md` |
| Start, pause and reset controls | TIMER-002, TIMER-003 | `test-cases/start-pause-and-reset-controls.md` |
| Session cycle with long break | TIMER-004 | `test-cases/session-cycle-with-long-break.md` |
| End-of-session sound and notification | TIMER-005, TIMER-006 | `test-cases/end-of-session-sound-and-notification.md` |
| Daily session counter | TIMER-007, TIMER-008 | `test-cases/daily-session-counter.md` |
| Settings for the three durations | TIMER-009, TIMER-010 | `test-cases/settings-for-the-three-durations.md` |
