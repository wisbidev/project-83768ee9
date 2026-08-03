# Test Cases — End-of-session sound and notification

Module: `timer`
Plan item: 4. End-of-session sound and notification (feature/P2)
Requirements: TIMER-005 — Audible chime at session end; TIMER-006 — Browser
notification at session end
Story: `docs/timer/stories/end-of-session-sound-and-notification.md` (AC-1…AC-8,
AC-12)

## Scope and risk

This item adds the two "did a session really end" cues: a chime and a browser
notification. The core timer keeps working without them, but the acceptance is
that a cue fires at **every** session end, which is easy to get subtly wrong in
three places: browser autoplay policies (audio must be unlocked inside a user
gesture), background-tab timing (the chime must not depend on visible-tab
ticks), and the permission lifecycle (requested on first Start, never on load;
sound-only status line when denied). Risk assigned: **medium** — failures here
are silent to the User (no sound, no notification, no obvious error), so the
cases pin each observable cue to a specific call or DOM state.

Per the task instruction, the cases cover the happy path plus the permission
states the acceptance criteria name explicitly (granted, default, denied). The
failure-table edge cases in the SRS (unsupported `Notification` API,
unavailable `AudioContext`, permission default with no Start ever pressed) are
out of scope for this happy-path set.

## Cases

**Scenario**: A chime plays when a Work session ends
**Given**: a Work session running with 3 seconds left, started by pressing
Start (a user gesture, so the audio context is unlocked)
**When**: the countdown reaches 0
**Then**: a short three-tone chime is played exactly once

Traces to: TIMER-005 AC-1 and behaviour 1; story AC-1. Automated (mock
`AudioContext`; assert one chime playback call at session end).

**Scenario**: A chime plays when a Short Break session ends
**Given**: a Short Break session running with 3 seconds left
**When**: the countdown reaches 0
**Then**: a short three-tone chime is played exactly once

Traces to: TIMER-005 behaviour 1 ("any session (Work, Short Break or Long
Break)"). Automated (mock `AudioContext`; assert the chime playback call).

**Scenario**: A chime plays when a Long Break session ends
**Given**: a Long Break session running with 3 seconds left
**When**: the countdown reaches 0
**Then**: a short three-tone chime is played exactly once

Traces to: TIMER-005 behaviour 1. Automated (mock `AudioContext`; assert the
chime playback call).

**Scenario**: The chime still plays when the tab is in the background
**Given**: the timer running with 3 seconds left and the tab hidden
(backgrounded)
**When**: the countdown reaches 0 while the tab is hidden
**Then**: the chime still plays exactly once

Traces to: TIMER-005 AC-2 and behaviour 2; story AC-2. Automated (mock
`AudioContext`; drive the session end from the wall-clock path with the tab
hidden).

**Scenario**: No sound is created and no permission prompt appears at page load
**Given**: the page loads and no user gesture has happened yet
**When**: the page finishes loading
**Then**: no `AudioContext` is created or resumed and no notification
permission prompt appears

Traces to: TIMER-005 behaviour 3 and TIMER-006 behaviour 2 ("requested on first
Start, never at page load"); story AC-3. Automated (assert `AudioContext` and
`Notification.requestPermission` are not called on load).

**Scenario**: A notification names the finished and next session when a Work
session ends
**Given**: notification permission is granted and a Work session is running
with 3 seconds left
**When**: the countdown reaches 0
**Then**: a notification titled `Pomodoro Timer` appears whose body reads `Work
finished — time for a short break.`

Traces to: TIMER-006 AC-1 and behaviour 1; story AC-5. Automated (mock
`Notification`; assert the constructor call with title and body).

**Scenario**: The notification names the long break when the cycle position
calls for one
**Given**: notification permission is granted, the timer is in Work at cycle
position 4 of 4 (three Work sessions already completed this cycle)
**When**: the Work countdown reaches 0
**Then**: a notification appears whose body reads `Work finished — time for a
long break.`

Traces to: TIMER-006 behaviour 1 (names the actual next session); story AC-5
(long-break variant) and AC-12. Automated (mock `Notification`; assert the body
matches the cycle-computed next type).

**Scenario**: A notification names the next Work session when a Short Break
ends
**Given**: notification permission is granted and a Short Break session is
running with 3 seconds left
**When**: the countdown reaches 0
**Then**: a notification appears whose body reads `Short Break finished — time
for work.`

Traces to: TIMER-006 behaviour 1; story AC-6. Automated (mock `Notification`;
assert the constructor call with title and body).

**Scenario**: A notification names the next Work session when a Long Break ends
**Given**: notification permission is granted and a Long Break session is
running with 3 seconds left
**When**: the countdown reaches 0
**Then**: a notification appears whose body reads `Long Break finished — time
for work.`

Traces to: TIMER-006 behaviour 1 (a cue fires at each session end). Automated
(mock `Notification`; assert the constructor call with title and body).

**Scenario**: Permission is requested on the first Start, never at page load
**Given**: notification permission is `default` and the page has loaded without
any prompt
**When**: the User presses Start for the first time
**Then**: the browser shows the notification permission prompt exactly then,
and no prompt was shown at page load

Traces to: TIMER-006 AC-2 and behaviour 2; story AC-4. Automated (mock
`Notification.requestPermission`; assert it is called once, on Start, and not
on load).

**Scenario**: With permission denied, a session ends sound-only with a status
line and the timer keeps working
**Given**: notification permission is denied and a Work session is running with
3 seconds left
**When**: the countdown reaches 0
**Then**: no notification appears, the chime still plays, the Settings card
shows the status line `Browser notifications are blocked — you will get sound
only. Allow notifications in your browser settings.` with the warning styling,
and the timer keeps working with no error

Traces to: TIMER-006 AC-3 and behaviour 3; story AC-7. Automated (mock
`Notification`; DOM assertion on `#notifStatus`/`#notifStatusText` and the
timer state after the session end).

**Scenario**: A denial from a previous visit shows the blocked status line on
load
**Given**: notification permission is `denied` (denied during an earlier
visit) and the page loads
**When**: the page finishes loading
**Then**: the blocked status line is visible in the Settings card and no
permission prompt is shown

Traces to: TIMER-006 behaviour 3 (status line explains sound-only mode); story
AC-8. Automated (mock `Notification` with `permission = "denied"`; DOM
assertion on `#notifStatus`; assert `requestPermission` is not called on load).

## Traceability check

| Case | Traces to | Automation |
|---|---|---|
| Chime plays when a Work session ends | TIMER-005 AC-1, behaviour 1 | Automated |
| Chime plays when a Short Break ends | TIMER-005 behaviour 1 | Automated |
| Chime plays when a Long Break ends | TIMER-005 behaviour 1 | Automated |
| Chime still plays in a background tab | TIMER-005 AC-2, behaviour 2 | Automated |
| No sound or permission prompt at page load | TIMER-005 behaviour 3, TIMER-006 behaviour 2 | Automated |
| Notification on Work end names finished and next session | TIMER-006 AC-1, behaviour 1 | Automated |
| Notification names the long break at cycle position 4 | TIMER-006 behaviour 1 | Automated |
| Notification on Short Break end names next Work | TIMER-006 behaviour 1 | Automated |
| Notification on Long Break end names next Work | TIMER-006 behaviour 1 | Automated |
| Permission requested on first Start, not on load | TIMER-006 AC-2, behaviour 2 | Automated |
| Denied: sound-only, status line, timer keeps working | TIMER-006 AC-3, behaviour 3 | Automated |
| Denial from a previous visit shows the status line on load | TIMER-006 behaviour 3 | Automated |

Every SRS acceptance criterion for TIMER-005 (AC-1, AC-2) and TIMER-006
(AC-1, AC-2, AC-3) has at least one case. The denied-permission cases are
included because they are named acceptance criteria (TIMER-006 AC-3; story
AC-7, AC-8), not invented edge cases. The failure-table edge cases (unsupported
`Notification`, unavailable `AudioContext`, permission default with no Start
ever pressed) are out of scope per the happy-path instruction. All cases are
automated: every observable cue is assertable by mocking the `Notification`
and `AudioContext` APIs and asserting the DOM, so nothing here needs manual
verification.
