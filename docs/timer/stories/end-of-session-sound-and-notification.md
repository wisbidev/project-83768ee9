# Story — End-of-session sound and notification

**Module:** `timer`
**Plan item:** 4 — End-of-session sound and notification
**SRS:** `docs/timer/SRS.md` §4.4 (TIMER-005, TIMER-006)
**Design:** `design/index.html` — Settings card notification status line (`#notifStatus`); chime and browser notification are audible/OS-rendered, not page UI
**Note:** `design/design-system.md` does not exist for this project; the approved mockup `design/index.html` and `docs/architecture/overview.md` §4 tokens are the design constraints.

## User story

*As a* User, *I want to* hear a chime and see a browser notification when a session ends, *so that* I notice the transition to the next session even when I am not watching the screen.

## In scope

- **Audible chime on every session end.** When any session (Work, Short Break or Long Break) reaches zero, the page plays a short three-tone chime exactly once.
- **Chime works in the background.** The chime plays even when the tab is hidden; nothing about sound depends on the tab being visible.
- **Audio unlocked within a user gesture.** The `AudioContext` is created/resumed the first time the User presses Start (or Pause) — never at page load — so browser autoplay policies do not block the chime. Playback itself happens when the session ends.
- **Browser notification on every session end.** When notification permission is granted, the page shows a notification titled `Pomodoro Timer` whose body names the session that finished and the one that follows, e.g. `Work finished — time for a short break.` and `Long Break finished — time for work.`
- **Permission requested on first Start, never on load.** If permission is `default`, the first press of Start asks the browser for permission. Page load never triggers a permission prompt.
- **Sound-only fallback.** If notifications are unsupported or denied, the page keeps working normally with the chime only, and the notification status line in the Settings card shows a short explanation.
- **Status line reflects permission.** On load and after any permission change, `#notifStatus` shows the blocked message when permission is `denied` (including a denial from a previous visit) and hides otherwise.
- **Graceful degradation.** Missing `Notification` API or an unavailable `AudioContext` never throws and never breaks the timer; each failure degrades to the remaining channels (sound only, or notification only, or silent end).

## Out of scope

- **Automatic advance to the next session, cycle dots, and the "Session N of 4" label** — story 3 (Session cycle with long break). This story fires the chime and notification at the moment a session ends; story 3 owns what happens next.
- **Mute toggle, volume control, or sound selection in Settings** — the SRS defines no sound settings; the chime always plays.
- **Choosing or customising the notification text** beyond the SRS-specified pattern — the body is generated from the finished and next session names.
- **Toast feedback** — the bottom-centre toast belongs to cycle transition (story 3) and settings (story 6) feedback; the blocked-notification status is the persistent `#notifStatus` line, not a toast.
- **Daily counter increments and persistence** — story 5. The session-end point also increments the counter there, but this story does not implement it.
- **Persisting any preference beyond the browser-managed permission** — no localStorage keys are read or written by this story.
- **Server-side or cross-device notification** — static shape: everything runs in the browser, nothing leaves the page.

## UI scope

This story has UI and must go through the UI stages. It touches one element of the approved design and two browser-rendered surfaces:

- **Notification status line** (`#notifStatus`, in the Settings card): shows the blocked message — `Browser notifications are blocked — you will get sound only. Allow notifications in your browser settings.` — with the `.warn` styling only when permission is `denied`; hidden otherwise. `role="status"` and the text inside `#notifStatusText`.
- **Browser notification**: rendered by the OS/browser, not by the page; title `Pomodoro Timer`, body `{Finished} finished — time for {next}.` with the next session name lower-cased.
- **Chime**: audible only, no visible element.

No new palette colours, no edits to `globals.css`, and no changes to the timer card layout.

## Acceptance criteria

Observable behaviours — Test derives cases directly from these:

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A running session with 3 seconds left | the countdown reaches 0 | an audible three-tone chime plays, exactly once |
| AC-2 | The tab is in the background | a session ends | the chime still plays |
| AC-3 | The page loads with no user gesture yet | the page finishes loading | no sound is created or played and no permission prompt appears (AC-9) |
| AC-4 | The User presses Start for the first time, permission `default` | the press is handled | the browser shows the notification permission prompt |
| AC-5 | Notification permission is `granted` | a Work session ends | a notification titled `Pomodoro Timer` appears with body `Work finished — time for a short break.` (or `time for a long break` when the cycle position makes the next session a long break) |
| AC-6 | Notification permission is `granted` | a Short Break session ends | a notification appears with body `Short Break finished — time for work.` |
| AC-7 | Notification permission is `denied` | a session ends | no notification appears, the chime plays, and the `#notifStatus` line in Settings shows the blocked message with the `.warn` styling |
| AC-8 | Notification permission is `denied` (from a previous visit) | the page loads | the blocked status line is visible on load; no permission prompt is shown |
| AC-9 | The browser does not support `Notification` | a session ends | no notification and no error; the chime still plays and the timer keeps working |
| AC-10 | Permission is `default` and the User never pressed Start | a session ends | no notification is shown (permission was only ever requested on Start) |
| AC-11 | `AudioContext` cannot be created (unsupported or blocked) | a session ends | no chime and no error; the session still ends, and the notification (if permitted) still fires |
| AC-12 | Permission was `granted`, then the User starts a session | a session ends | the notification names the finished session and the actual next session exactly as the cycle will advance (matches story 3's computed next type) |

## Dependencies

- **Story 3 — Session cycle with long break** must land first: it owns the session-end hook this story plugs into, and the notification body needs the next-session name (short vs long break) that story 3's cycle logic computes.
- **Stories 1 and 2** (already in the pipeline) provide the `"use client"` timer component and the running state this story attaches to.
- No external accounts, credentials, or third-party services — browser APIs only (`Notification`, `AudioContext`).

## Technical constraints

- The component holding this logic must start with `"use client"` as its first line (browser APIs + React state + event handlers), per architecture §5.2.
- `AudioContext` is created/resumed only inside the Start/Pause user gesture (architecture §5.4); the chime itself is scheduled when the session ends.
- The chime fires from the same wall-clock session-end path that story 3 uses, so it works with the tab in the background (no reliance on visible-tab ticks).
- Notification permission is requested only on the first Start press, never on page load (TIMER-006.2).
- Every `Notification` / `AudioContext` call is guarded (feature detection plus try/catch) so a failure degrades gracefully and never throws (TIMER-005/006 failure behaviour).
- Do not edit `globals.css`, `app/page.tsx` (stays a Server Component), or add palette colours; no new localStorage keys.
