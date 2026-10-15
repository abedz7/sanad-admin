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

- **After server Phase 2:** run `npm run seed` in `sanad-server` and use the demo admin it prints
  (email only; the password comes from the server's `.env`).
- **Before the seed exists:** register a user via `POST /auth/register` and flip its `role` to
  `"admin"` directly in Mongo.

Session model: 15-minute access token in memory, silent restore on reload via the httpOnly
refresh cookie, automatic single-flight refresh on 401, redirect to sign-in with a notice when
the session truly expires.

## Current scope (Phase 3a)

Sign-in, session handling and the app shell are fully functional against the live server, as is
the Team panel on the dashboard (`GET /admin/users`). The stats, tickets and categories screens
are built against the contract and intentionally render their error state (the server returns 404)
until the server's Phase 2 endpoints land — loading, empty and error states are real, no mock data.

## Screenshots

_Placeholder — added once server Phase 2 provides seeded data worth showing._
