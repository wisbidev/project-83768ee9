# Story — Settings for the three durations

Module: `timer` · Plan item 6 · Implements SRS TIMER-009, TIMER-010

## User story

*As a* User, *I want to* change the Work, Short Break and Long Break durations in a Settings card and have them persist, *so that* the timer fits my preferred schedule and I only set the values once.

## In scope

- A Settings card (approved design §"Settings") with three numeric inputs in minutes: **Work**, **Short break**, **Long break**, prefilled from saved values or the defaults `25 / 5 / 15`.
- **Save settings** button: validates/clamps the three values, writes them to `localStorage`, restarts the current session stopped at the new duration of its own type, and shows a confirmation toast.
- **Reset to defaults** button: restores `25 / 5 / 15`, applies them the same way (current session restarts stopped at its default duration), updates the inputs, and persists.
- Pressing `Enter` inside any of the three duration inputs saves, same as the Save button.
- Clamping on save: Work and Long Break 1–120 whole minutes, Short Break 1–60; any out-of-range, empty, or non-numeric value clamps to the nearest valid bound (below 1 → 1, above max → max). Inputs themselves keep `min`/`max` attributes from the design.
- Persistence: one `localStorage` key (`pomodoro:settings`, shape `{ work, short, long }` — architecture §10), read on page start; invalid/missing entries fall back to defaults.
- All state handling is a client component (`"use client"` first line); every `localStorage` read/write is wrapped in try/catch so the app never crashes (TIMER-001 failure behaviour).

## Out of scope

- Sound, notification, or any other settings beyond the three durations — separate function (End-of-session sound and notification).
- Per-task durations, presets, profiles, or syncing across devices — deliberately not built; static site by design.
- Changing the cycle order, the four cycle dots, or the daily counter — settings only affect durations (SRS TIMER-004: "Settings changed mid-cycle … only durations apply to future sessions").
- Fractional minutes (e.g. 25.5) — whole minutes only.
- Editing `design/index.html` or `app/globals.css` — the Settings UI is implemented as a story PR against the Next.js app, matching the approved design.

## UI scope

The **Settings card** section of the approved design (`design/index.html`, `#settings`):

- Heading "Settings" with the gear icon and the subtitle "Durations are saved in this browser and applied to the current and next sessions."
- Three fields in a `field-grid` (stack to one column on narrow screens ≤ ~480 px): each has a `<label>` (Work / Short break / Long break), a `<input type="number">` with `min`/`max` (`1–120`, `1–60`, `1–120`) and `inputmode="numeric"`, and a `min` unit suffix. Focus styles: border turns tomato `#E4572E`, background turns white.
- Actions row: ghost "Reset to defaults" button (underlined, muted → tomato on hover) and primary "Save settings" button (ink `#2B2B33` background, white label).
- On save: the bottom-centre **toast** shows "Settings saved — applied to the current session."; on reset: "Defaults restored" (matching the design's toast behaviour). The toast exists in the design; if it is not yet implemented by a prior story, this story provides it.
- States the card must support: default values (25/5/15), saved values, clamped values, saved-and-applied.

Colours from the approved design tokens: primary tomato `#E4572E`, cream background `#FBF6EF`, ink `#2B2B33`, green `#2F9E77` (Short Break), blue `#3B6FE0` (Long Break).

## Acceptance criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | A fresh page with default settings, timer paused at Work | the User changes Work to 50 and presses Save settings | the current session restarts stopped at `50:00` labelled `Work`, and the toast confirms the save |
| AC-2 | Work = 50 saved | the User reloads the page | the Work input reads 50 and the timer shows `50:00` |
| AC-3 | Work = 30, Short = 10, Long = 20 saved | the User reloads the page | the three inputs read 30 / 10 / 20 and the timer shows the saved Work duration |
| AC-4 | The timer is running a Work session at `10:15` | the User saves Work = 50 | the session stops and restarts at `50:00` — it never continues mid-flight |
| AC-5 | The Work input holds 0 | the User saves | the Work input and timer show `01:00` (clamped to the minimum) |
| AC-6 | The Short break input holds 120 | the User saves | the Short break value is `60` (clamped to the max) |
| AC-7 | A saved Short break of 5 minutes exists | a Work session completes | the timer advances to a Short Break of `05:00` (saved duration feeds the cycle) |
| AC-8 | Saved settings exist (e.g. Work = 50) | the User presses Reset to defaults | all inputs read `25 / 5 / 15`, the current session restarts stopped at its default duration, and the values persist |
| AC-9 | The Work input is focused | the User presses `Enter` | settings save exactly as with the Save button (same clamping, restart, toast) |
| AC-10 | `pomodoro:settings` holds an invalid value (e.g. Work = 999) | the page loads | Work falls back to the default 25; the page never crashes |
| AC-11 | `pomodoro:settings` is unreadable JSON | the page loads | defaults 25/5/15 are used and the page renders normally |
| AC-12 | `localStorage` throws on save (private mode / quota) | the User saves | the toast still appears and the current session restarts at the new duration; nothing crashes |

## Dependencies

- **"Countdown display and session type"** (TIMER-001) — the timer must render a session-type label and an MM:SS countdown driven by the current type's duration; this story restarts that session at a new duration.
- **"Start, pause and reset controls"** (TIMER-002, TIMER-003) — the running state and reset semantics this story reuses when a save stops and restarts the current session.
- **"Session cycle with long break"** (TIMER-004) — duration changes apply to future sessions advanced by the cycle (AC-7); safe to build against the cycle once it lands.
- **Storage key:** `pomodoro:settings` per architecture §10. The design prototype's mock code used `pomodoro.durations` — that was a scratch implementation; architecture is authoritative.
- No external accounts, no backend, no network — browser `localStorage` only.
