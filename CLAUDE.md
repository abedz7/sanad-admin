# sanad-admin — rules for anyone (human or agent) working in this repo

Sanad is a Support Ticket / Helpdesk system built as a 48-hour technical assessment. Reviewers grade
component organisation, state handling, permissions and error handling, README quality, commit
history and, above all, **security**. Every choice must be defensible in an interview.

The API contract is owned by `sanad-server`. `docs/API.md` here is a byte-identical copy of
`sanad-server/docs/API.md`; never edit it in this repo — change it upstream and re-copy.

## Stack (fixed — do not substitute without asking)

Vite · React 19 · TypeScript (strict) · react-router · TanStack Query · axios · react-hook-form +
zod · Tailwind CSS 4 · Radix primitives (dialog/select/tabs) for accessibility only.

## Architecture rules

- `src/app/` (router, shell, guards) · `src/lib/` (api client, query client, env) ·
  `src/features/<name>/` (api.ts, hooks.ts, components/, pages/) · `src/components/ui/` and
  `src/components/states/` (one component per file, typed props) · `src/types/api.ts` (hand-written
  from docs/API.md; the single source of truth for enums).
- Server state lives in TanStack Query, form state in react-hook-form, session state in
  AuthProvider; no global state library.
- Status/priority labels, colours and allowed transitions come from `src/lib/labels.ts` only.
- Every list screen has real loading / empty / error states; an `ErrorState` shows the message,
  a Retry button and the `requestId`.

## Security rules (non-negotiable)

- Access token lives in a module-level variable only — never localStorage/sessionStorage, never
  logged, never in React state that could be serialised.
- Refresh token is an httpOnly cookie owned by the server; the client never reads or stores it.
- Dev server proxies `/api` → `VITE_API_URL` so the browser is same-origin with the API.
- On 401: one shared refresh promise, retry the original request once; on refresh failure clear
  token + query cache and dispatch `session-expired`.
- Sign-in shows one generic error for every 401. No `dangerouslySetInnerHTML` (lint error).
- The 401→refresh interceptor skips only `/auth/login`, `/auth/register`, `/auth/refresh` and
  `/auth/logout`; every other route, `/auth/me` included, gets the silent refresh.
- Sign-out calls `POST /auth/logout` (needs only the cookie, not a live access token), then clears
  the token and the query cache whatever the server answered.
- Never log tokens, cookies or request headers; no `console.log` of API responses in committed code.
- `withCredentials` is sent only to our own origin (`/api`), never to a third-party URL.
- Attachments are fetched through the authenticated download endpoint with the bearer token and
  saved via an object URL that is revoked after use. Never `<a href={apiUrl}>` to an attachment.
- Only the status transitions the contract allows for an admin are offered in the UI; the server
  still decides, and a 409 is rendered as a toast, never swallowed.
- List filters, search, sort and page live in the URL (`useSearchParams`) so views are shareable.
- `.env` is gitignored; `.env.example` has placeholders only. In production the same same-origin
  rule holds: the host (Vercel) rewrites `/api/*` to the API server, so the cookie stays
  `SameSite=Strict`. Never relax the cookie to make cross-site calls work.

## Engineering rules

- Build only what `docs/PLAN.md` (server repo) and `docs/API.md` specify; propose anything else first.
- Every dependency gets one paragraph in `docs/DECISIONS.md`. No `any` without a comment. No `@ts-ignore`.
- `npm run lint && npm run typecheck` before every commit.
- Commits: conventional, one concern each, in the author's name only — no bot trailers. Never commit
  `.env`, `node_modules`, `dist`, coverage or logs. Commit early and often; the history is graded.
