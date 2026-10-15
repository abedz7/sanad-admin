# sanad-admin — rules for anyone (human or agent) working in this repo

Admin web dashboard for **Sanad**, a Support Ticket / Helpdesk system built as a 48-hour technical
assessment. Reviewers grade component organisation, state handling, permissions and error handling,
README quality, commit history and, above all, **security**.

## Contract

`docs/API.md` is a **verbatim copy** of `sanad-server/docs/API.md`. The server owns it. Never invent
an endpoint, field or error code: if something is missing, stop and report the gap. `src/types/api.ts`
is hand-written from the contract and is the only place enums (status, priority, role, error codes) live.

## Stack (fixed — do not substitute without asking)

React 19 · Vite · TypeScript (strict) · react-router · TanStack Query · axios · react-hook-form + zod ·
Tailwind CSS · Radix primitives only where accessibility is hard (dialog, select, tabs).

## Architecture rules

- `src/features/<name>/` holds `api.ts` (typed calls), `hooks.ts` (TanStack Query), `components/`,
  `pages/`. Shared UI lives in `src/components/ui/`; shared states in `src/components/states/`
  (`EmptyState`, `ErrorState`, `Skeleton`). No one-off inline styles or ad-hoc components in pages.
- Every page renders all three of loading / empty / error. Error states say what happened and offer
  a retry. Empty states invite an action.
- List filters, search, sort and page live in the URL (`useSearchParams`) so views are shareable.
- Status and priority colours come from one map in `src/lib/labels.ts`; nothing else hard-codes them.
- Only the transitions the contract allows for an admin are offered in the UI; the server still decides.

## Security rules (non-negotiable)

- Access token is kept **in memory only** (module-level variable in `src/lib/api.ts`). Never in
  `localStorage`, `sessionStorage`, cookies set by JS, or React state that persists.
- Refresh token is an `httpOnly` cookie set by the server; this app never reads or stores it. The
  axios client sends `withCredentials: true` only to the API origin.
- On any `401`: one silent refresh attempt, then retry the original request once. If refresh fails:
  clear memory, clear the query cache, redirect to `/sign-in` with a "Session expired" notice.
- Sign-out calls `POST /auth/logout`, then clears memory and the query cache, whatever the server said.
- Never log tokens, cookies or request headers. No `console.log` of API responses in committed code.
- `dangerouslySetInnerHTML` is forbidden (ESLint `react/no-danger`). All user text is rendered as text.
- Attachments are fetched through the authenticated download endpoint with the bearer token and
  saved via an object URL that is revoked after use. Never `<a href={apiUrl}>` to an attachment.
- `VITE_API_URL` is the only env var. `.env` is gitignored; `.env.example` has placeholders only.

## Engineering rules

- Build only what `docs/API.md` and the screen list in the brief specify. Propose before adding
  anything else or anything structural.
- Prefer boring, well-known libraries; each dependency gets one paragraph in `docs/DECISIONS.md`.
- No `any` without a comment. No `// @ts-ignore`.
- Commits: conventional (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`), one concern each,
  small, in the author's name only — no bot trailers. Never commit `.env`, `node_modules`, `dist`.
- README: prereqs, env vars, `npm install && npm run dev`, demo admin account (email only),
  screenshots of every screen.
