# Sanad Admin

Admin web dashboard for **Sanad**, a support ticket / helpdesk system. Staff sign in here to
triage tickets, manage categories and watch workload stats. Built with Vite, React 19,
TypeScript (strict), TanStack Query, react-hook-form + zod, Tailwind CSS 4 and Radix primitives.

The API contract lives in [`docs/API.md`](docs/API.md) (a verbatim copy owned by `sanad-server`).
Design tokens and principles: [`docs/DESIGN.md`](docs/DESIGN.md). Library and pattern rationale:
[`docs/DECISIONS.md`](docs/DECISIONS.md).

## Prerequisites

- Node.js ≥ 22
- A running `sanad-server` (sibling repo) — see its README; in short:
  ```sh
  cd ../sanad-server
  docker compose up -d   # MongoDB 7
  npm install && npm run dev   # API on http://localhost:4000
  ```

## Environment

```sh
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Target of the dev proxy. The browser itself always calls `/api` on its own origin, so the server's httpOnly refresh cookie works without CORS. |

## Run

```sh
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run lint` · `npm run typecheck` · `npm run build` · `npm run preview`.

## Signing in

Only accounts with `role: "admin"` can sign in on the web client.

Run `npm run seed` in `sanad-server` (idempotent) and sign in as the demo admin
**`admin@sanad.demo`** — the password comes from `SEED_ADMIN_PASSWORD` in the server's `.env` and
is never printed or committed.

Session model: 15-minute access token in memory, silent restore on reload via the httpOnly
refresh cookie, automatic single-flight refresh on 401, redirect to sign-in with a notice when
the session truly expires.

## Deploying to Vercel

`vercel.json` carries two rewrites, in order: `/api/:path*` is proxied to the API server, and
everything else falls back to `/index.html` (SPA routing). The browser therefore only ever calls
its own origin — exactly the shape the Vite dev proxy gives locally — so the httpOnly
`SameSite=Strict` refresh cookie works in production unchanged, with no CORS and no cookie
relaxation. `VITE_API_URL` is not used on Vercel (it only feeds the dev proxy); the rewrite
points at the deployed API (`sanad-server-production-8573.up.railway.app`).

## Current scope

Everything is built against API contract **1.3.0** (`docs/API.md`) and verified live: sign-in
(with a password visibility toggle) and session handling; a profile menu (avatar with initials,
editable display name via `PATCH /auth/me`, read-only email, role chip, sign out); dashboard with
stat tiles (linked to the filtered list, count-up on first paint), priority breakdown (bars
animating in on load), open-age block and Team panel; ticket list with URL-synced filters,
debounced search, sort and pagination; ticket detail with status-machine controls,
assignee/priority/category editing, conversation with internal notes, authenticated attachment
downloads and the history timeline; category management with create/edit/soft-delete and 409
handling. Loading, empty and error states are real throughout, now with shimmering skeletons that
respect `prefers-reduced-motion`; every mutating action shows a width-preserving button spinner.

The layout is responsive: the sidebar collapses to a top bar with a drawer menu at ≤1024px; at
≤768px the tickets and categories tables become card lists, filters stack, the ticket detail
control strip wraps and its tabs scroll horizontally, and dialogs go full-width with 16px gutters.
No horizontal page scroll down to 375px.

## Screenshots

Taken against the seeded server, in [`docs/screenshots/`](docs/screenshots):

| | |
|---|---|
| ![Sign in](docs/screenshots/sign-in.png) | ![Dashboard](docs/screenshots/dashboard.png) |
| ![Tickets](docs/screenshots/tickets.png) | ![Categories](docs/screenshots/categories.png) |
