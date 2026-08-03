# Architecture Overview — Pomodoro Timer

**Module:** `timer`
**Shape:** `static` — frontend only, no backend, no database
**Last updated:** 2026-06-04

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 15 App Router + TypeScript | Single-page app; SSR not needed but Next.js provides routing, bundling, and ESLint out of the box |
| Styling | Tailwind CSS v3 | Utility-first; matches SRS colour tokens directly; no design system file exists to override |
| Lint | ESLint + `next/core-web-vitals` | Required CI gate; `next lint` is the standard for Next.js projects |
| Runtime | Browser only | No backend, no database, no network requests at runtime |

**Rejected alternatives**

- **React SPA (CRA/Vite):** No routing or SSR is needed, but Next.js provides a standard scaffold, ESLint config, and `next build` without extra setup. A bare React project would need all of this wired manually.
- **CSS Modules or styled-components:** The SRS gives a flat colour palette with no design system file; Tailwind's utility model is faster for a single-page product and keeps CSS co-located with markup.
- **No build step (vanilla HTML/JS):** TypeScript is required by the stack convention; a compiled bundle catches type errors in CI before review.

---

## 2. Project Shape

```
static  →  frontend only  →  no backend, no database
```

This shape means:
- No `code/backend/` directory.
- No `db` service in Docker Compose.
- No API endpoint, no ORM, no migration.
- All state lives in `localStorage`; all logic runs in the browser.

---

## 3. Folder Structure

```
./
├── .env.example                # shared keys for compose (none needed for static)
├── .gitignore
├── docker-compose.yml           # single service: frontend
├── .github/
│   └── workflows/
│       └── ci.yml
└── code/
    └── frontend/               # Next.js app
        ├── .env.example
        ├── .eslintrc.json
        ├── .gitignore
        ├── Dockerfile
        ├── next.config.js
        ├── package.json
        ├── package-lock.json   # committed (npm ci requires it)
        ├── postcss.config.js
        ├── tailwind.config.ts
        ├── tsconfig.json
        └── app/
            ├── globals.css     # brand tokens + base styles
            ├── layout.tsx      # root layout, fonts
            └── page.tsx        # Server Component shell → composes children
```

---

## 4. Design Tokens (from SRS §5)

The SRS specifies these exact colours; they are the only palette.

| Token | Hex | Use |
|---|---|---|
| Primary / Work | `#E4572E` | Session pill (Work), brand, daily counter chip |
| Background | `#FBF6EF` | Page background |
| Ink | `#2B2B33` | Body text, running Pause button label |
| Short Break | `#2F9E77` | Session pill and ring when type = short |
| Long Break | `#3B6FE0` | Session pill and ring when type = long |

No additional design system file exists; `globals.css` is the single source of truth for tokens.

---

## 5. Key Design Decisions

### 5.1 Timer accuracy
The countdown is derived from the **wall clock** (timestamp delta), not from counting `setInterval` ticks. This prevents drift when the tab is backgrounded, as required by TIMER-002 AC-5.

### 5.2 Server / Client boundary
Next.js App Router renders every component as a **Server Component by default**. Any component that uses browser APIs (`window`, `localStorage`, `Notification`, `AudioContext`), React state (`useState`, `useEffect`, `useRef`), or event handlers (`onClick`, `onChange`) **must** start with the literal directive `"use client"` as the very first line.

- `app/page.tsx` stays a Server Component — it only composes children.
- `app/globals.css` is finished in the scaffold; story authors must not edit it.

### 5.3 localStorage failure handling
`localStorage` can throw in private browsing mode or when quota is exceeded. Every read/write is wrapped in a try/catch that falls back to defaults. The app never crashes on load (TIMER-001 failure behaviour).

### 5.4 Audio autoplay policy
`AudioContext` can only be created or resumed from within a **user gesture** (Start button click). Notification permission is also requested on the same gesture, not at page load (TIMER-005, TIMER-006).

### 5.5 No backend, no network at runtime
The built Next.js app is fully static. There are no `NEXT_PUBLIC_*` env vars consumed at runtime; `.env.example` is present only to satisfy the convention that every service documents its env vars.

---

## 6. Env Var List

### `code/frontend/.env.example`

```env
# No runtime env vars for a static site.
# This file exists to satisfy the convention that every service documents its vars.
# There are no secrets, no API URLs, and no runtime configuration.
```

### Root `.env.example`

```env
# No env vars needed — this is a static site with no backend.
# `docker compose up` boots only the frontend service.
```

---

## 7. How to Run

### Local development (no Docker)

```bash
cd code/frontend
npm install
npm run dev       # http://localhost:3000
```

### With Docker Compose (full stack — frontend only for this shape)

```bash
docker compose up --build   # http://localhost:3000
```

### Production build

```bash
cd code/frontend
npm run build
```

---

## 8. CI Workflow

`.github/workflows/ci.yml` runs on every PR and every push to `main`.

| Job | Steps |
|---|---|
| `frontend` | `setup-node 20` → `npm ci` → `npm run lint` → `npm run build` |
| `compose` | `docker compose config -q` (syntax validation only) |

No `backend` job — the shape has no backend.

---

## 9. Container Ports

| Service | Port | Note |
|---|---|---|
| `frontend` | `3000` | Next.js default; exposed in Dockerfile and compose |

---

## 10. Naming Conventions

- React components: **PascalCase** file and function name, `export default function ComponentName()`.
- CSS classes: **kebab-case** via Tailwind utilities.
- localStorage keys: **camelCase**, namespaced under `pomodoro:`.
  - `pomodoro:settings` — `{ work: number, short: number, long: number }`
  - `pomodoro:daily` — `{ count: number, date: string }` (date = `YYYY-M-D`)
- Timer states: `idle | running | paused`.

---

## 11. Accessibility Notes

- All controls keyboard-reachable with visible focus styles.
- Icon-only buttons have `aria-label`.
- Duration `<input>` elements have associated `<label>`.
- `prefers-reduced-motion` disables the SVG ring animation.
- Colour alone never conveys state (dots use both colour and fill).

---

## 12. Rollout & Compatibility

- No server to deploy; the built `out/` directory (or standalone Docker image) can be served from any static host (Vercel, S3, nginx).
- No database migration concerns.
- No backend breaking-change risk.

---

*Architecture decisions here may be extended by `docs/architecture/erd.md` (not applicable — no database) and `docs/architecture/services.md` (not applicable — no services). Those files are omitted for this shape.*
