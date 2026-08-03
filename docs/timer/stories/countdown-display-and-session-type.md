# Story: Countdown display and session type

**Module:** `timer`
**Plan item:** 1 — Countdown display and session type (P1)
**Implements:** TIMER-001 (Initial load state)
**Last updated:** 2026-06-04

## User story

As a User, I want to open the page and immediately see the current session type and the remaining time as a legible MM:SS countdown, so that I know at a glance which session I am in and how much time is left.

## In scope

- Render the Timer card of the approved single-page design: session-type pill, SVG progress ring, and MM:SS time display in one clean, centred layout.
- Show the session type label (`Work`, `Short Break`, `Long Break`) with the session colour applied to the pill and the ring: tomato `#E4572E` for Work, green `#2F9E77` for Short Break, blue `#3B6FE0` for Long Break.
- Introduce the session state model: `sessionType` (enum `work | short | long`) and `remainingSeconds` (integer), initialised on load. The timer state is `idle` — the countdown is paused at full duration and nothing ticks yet.
- Initial state: `sessionType = work`, `remainingSeconds = 25 × 60 = 1500`, displayed as `25:00`.
- Format the countdown as `MM:SS` with zero-padded minutes and seconds (e.g. `25:00`, `05:00`).
- Progress ring renders the fraction of time remaining; at load, 100 % remaining means a full ring, coloured by the session type.
- Fall back to the default initial state if `localStorage` is unavailable or corrupted — the page loads `Work / 25:00` and never crashes.

## Out of scope

- Start / pause / reset behaviour, wall-clock ticking, drift-free counting, and the `Space` / `R` shortcuts — plan item 2 (TIMER-002, TIMER-003).
- Automatic cycle advancement, the long-break rule, and the four cycle dots — plan item 3 (TIMER-004).
- End-of-session sound and browser notification — plan item 4 (TIMER-005, TIMER-006).
- Daily session counter — plan item 5 (TIMER-007, TIMER-008).
- Settings UI, saving durations, and loading saved settings from `localStorage` — plan item 6 (TIMER-009, TIMER-010). At this stage durations are the constants `25 / 5 / 15`; the work duration that seeds `remainingSeconds` is the constant 25.
- Any backend, network request, account, or database — the product is a static site by design.

## UI scope

One screen: the Timer card of the approved single-page design (`design/index.html`). Only static rendering is in scope — no interactions yet.

- **Session-type pill**: dot + label (`Work` by default). Colour variants per session type: default tomato for `work`, green (`is-green`) for `short`, blue (`is-blue`) for `long`.
- **Progress ring**: SVG circle track + progress circle, `aria-label` identifying it as the time-remaining ring. The progress stroke is coloured by session type; at load the ring is full (100 % remaining).
- **Time display**: the large `MM:SS` readout (e.g. `25:00`), plus the static sub-label from the design ("Stay focused" for the Work session). The readout keeps a visible label so the value is never conveyed by colour alone.
- **Responsive**: the card is legible and centred with no horizontal page scroll at 320 px and up, using the tokens from SRS §5 / `globals.css`.
- **Reduced motion**: nothing animates in this story (the ring pulse belongs to the running state in plan item 2), so no `prefers-reduced-motion` handling is needed here.

Implementation notes (from `docs/architecture/overview.md`):

- The component owning `sessionType` / `remainingSeconds` state uses React state, so its file must start with the literal directive `"use client"` as the very first line.
- `app/page.tsx` stays a Server Component — it only composes the timer card.
- No design-system file exists; `globals.css` is the single source of truth for the colour tokens.

## Acceptance criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The page loads with empty `localStorage` | the page finishes loading | the pill reads `Work` and the countdown reads `25:00` |
| AC-2 | The page has loaded and no start has been pressed | 3 seconds pass | the countdown still reads `25:00` — nothing ticks yet |
| AC-3 | The page has loaded in the Work state | inspecting the timer card | the pill and the ring progress stroke use the tomato colour `#E4572E`, and the pill text reads `Work` |
| AC-4 | The page has loaded | inspecting the countdown | the time is formatted `MM:SS` with zero-padded minutes and seconds (`25:00`, never `25:0` or `1500`) |
| AC-5 | The viewport is 320 px wide | the page loads | the timer card is fully visible with no horizontal page scroll and the countdown is legible |
| AC-6 | `localStorage` holds corrupted/unreadable data | the page finishes loading | the page shows `Work / 25:00` and never crashes |

## Dependencies

- Approved design (`design/index.html`) — already in place.
- Next.js scaffold with `globals.css` brand tokens and the CI gate (lint + build) — already in place.
- No other story must land first; this is the first story of the `timer` module. Plan items 2 and 6 build on the `sessionType` / `remainingSeconds` state and the `MM:SS` formatting introduced here.
