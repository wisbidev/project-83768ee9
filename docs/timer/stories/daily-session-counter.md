# Story — Daily session counter

Plan item: **5. Daily session counter** (module `timer`, P2)
Implements: TIMER-007 (Increment on completed work sessions), TIMER-008
(Persistence and daily reset)
Branch: `docs/story-daily-session-counter`

## User story

As a User, I want to see how many Work sessions I have completed today, with
the count surviving a reload and resetting for a new day, so that I can track
my daily output.

## In scope

- A counter chip in the top bar showing the number of Work sessions completed
  today, with the star icon, the count element (`#dailyCount`) and the label
  `work sessions today` exactly as in the approved design.
- The counter increments by exactly **one** each time a Work session's
  countdown actually reaches zero, inside the same session-end handler that
  advances the cycle (item 3) — one increment per completed Work session,
  never per tick or per start.
- Pausing, resetting, or skipping sessions never changes the counter; a Work
  session counts only when it completes. Completing a Short Break or a Long
  Break never changes it either.
- Persistence in `localStorage` under the key `pomodoro:daily`, holding
  `{ count: number, date: string }` where `date` is the local date string
  `YYYY-M-D` (e.g. `2026-6-4`), written on every increment.
- On page load, the stored value is read and shown as-is **only if** the
  stored date equals today; if the stored date is any other day, or the data
  is missing or malformed, the counter starts at 0 for today (no stale count
  is ever displayed).
- Midnight rollover with the tab left open: the date is compared again at
  completion time, so the first Work session that completes after midnight
  starts a fresh day — the counter resets to 0 and then increments to 1, and
  `pomodoro:daily` is written with today's date.
- Every `localStorage` read and write is wrapped in try/catch: if storage is
  unavailable (private mode, quota) or the value is corrupt, the page loads
  and ticks normally, the chip shows 0, no error is surfaced to the User, and
  the counter simply does not survive a reload.
- The restored counter is purely a display value on reload: the timer itself
  restarts at a full Work session, stopped (SRS §7 assumption); this story
  does not change that.

## Out of scope

- End-of-session sound chime and browser notification — own story (item 4);
  both stories extend the same session-end hook without conflicting.
- Cycle advance, cycle dots, and transition toasts — own story (item 3).
- Settings card and duration persistence — own story (item 6).
- Work/break history beyond today's count, or per-day history — deliberately
  not built (SRS §3); only today's count and its date are stored.
- Any way for the User to edit or reset the counter manually — deliberately
  not built; only a completed Work session changes it.
- Persisting the running timer or the cycle position — deliberately not
  built; a reload restores durations and the counter only (SRS §7).

## UI scope

Single page, top bar only. No new screens.

- **Daily counter chip** (header, right side) — star icon in primary tomato
  `#E4572E`, count element `#dailyCount` (an integer ≥ 0), label
  `work sessions today`, per `design/index.html`. It is visible in every
  timer state and on every session type.
- **States:** `default` (count 0) and `counted` (count N > 0). The chip is
  static chrome — the only dynamic part is the number in `#dailyCount`,
  updated at load and at each completed Work session.
- Copy on the page stays exactly `work sessions today` (design copy, quoted
  verbatim); the number renders in `#dailyCount`.

## Acceptance criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | The chip reads `0` | a Work session's countdown reaches 0 | the chip reads `1` next to `work sessions today` |
| AC-2 | The chip reads `3` | a Short Break or a Long Break completes | the chip still reads `3` |
| AC-3 | The chip reads `2` and a Work session is running | the User presses Reset | the chip still reads `2` |
| AC-4 | The chip reads `4` with today's date stored in `pomodoro:daily` | the User reloads the page | the chip reads `4`, not `0` and not `8` |
| AC-5 | `pomodoro:daily` holds a count from yesterday | the page loads | the chip reads `0` for today |
| AC-6 | The page has been open since yesterday | a Work session completes after midnight | the chip reads `1` (reset to 0, then incremented — never the previous total plus one), and `pomodoro:daily.date` is today's date |
| AC-7 | A Work session completes | the session-end handler fires twice for that same completion | the chip increments exactly once |

## Failure and boundary behaviour

| Case | Condition | Expected behaviour |
|---|---|---|
| Storage unavailable | `localStorage` throws on read or write (private mode, quota) | The page loads and ticks normally; the chip shows 0; no error is surfaced; the count does not survive a reload |
| Corrupted stored value | Stored count is not a number, or the date is missing/malformed | Treated as no saved data; the chip starts at 0 (SRS TIMER-008 failure behaviour) |
| Rapid double-fire | Session end fires twice for one completion | The chip increments exactly once — the guard is at the session-end hook, and the new session starts paused at full duration, so it cannot immediately re-complete |
| Reload mid-session | User reloads while a Work session is running | The chip restores today's count; the timer restarts at a full Work session, stopped; the two are independent |
| Midnight boundary | A session completes at 23:59:59 vs 00:00:00 | The date is read at completion time, so a completion after midnight starts a fresh day (AC-6); a completion before midnight keeps the current day's count |
| Reset, pause, or a break end | Any of these happen | The counter never changes — only an actually completed Work session increments it |

## Dependencies

- **Stories that must land first:** item 1 (Countdown display and session
  type) — it defines the header/top-bar structure the chip lives in — and
  item 3 (Session cycle with long break) — it defines the session-end handler
  that fires when a Work session reaches zero; this story adds the counter
  increment to that same hook (per item 3's explicit note that the handler
  stays a single shared hook). Item 4 (sound/notification) extends the same
  hook and must not conflict; the increment is independent of it.
- **Design:** approved — chip markup, icon, and copy quoted verbatim from
  `design/index.html`; colours from SRS §5 / architecture overview §4.
- **Storage contract:** `pomodoro:daily` = `{ count: number, date: string }`
  (local date `YYYY-M-D`), camelCase namespaced key per architecture
  overview §10.
- **No external accounts, data, or services.**
