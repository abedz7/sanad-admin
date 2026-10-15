# sanad-admin — decisions

One paragraph per library or pattern; each must be defensible in an interview.

## Vite dev proxy for a same-origin cookie

The server issues the refresh token as an `httpOnly; SameSite=Strict` cookie scoped to
`/api/v1/auth/refresh`. If the SPA on `:5173` called the API on `:4000` directly, that cookie would
be cross-site: `SameSite=Strict` would block it and we would need CORS with credentials. Instead
the dev server proxies `/api` → `VITE_API_URL`, so the browser only ever talks to its own origin —
the cookie flows naturally, no CORS configuration, and production can use the same shape with any
reverse proxy in front of the API.

## In-memory access token

The access token lives in a module-level variable in `src/lib/api.ts`, set on login/refresh and
cleared on sign-out — never localStorage or sessionStorage. Web Storage is readable by any script
that gets to run on the page, so an XSS bug would hand over a bearer token; a variable dies with
the tab and is far harder to exfiltrate wholesale. The cost — losing the token on reload — is paid
by the refresh cookie: on boot the app calls `/auth/refresh` and restores the session invisibly.

## Single-flight refresh queue

Access tokens last 15 minutes, so several in-flight requests can 401 at the same moment. Refresh
tokens rotate on every use and the server revokes the whole family on reuse — two parallel refresh
calls would look like token theft and kill the session. The response interceptor therefore funnels
every 401 into ONE shared refresh promise; all waiters resume with the new token and each original
request retries exactly once. 401s from `/auth/*` routes are excluded so a wrong password or an
expired refresh can never loop.

## TanStack Query for server state

All API reads go through `useQuery` hooks per feature (`src/features/*/hooks.ts`). It gives caching
keyed by filter params, request deduplication, retry policy (never on 4xx — those are
deterministic), and pending/error/success discrimination that maps 1:1 onto our
Skeleton/ErrorState/EmptyState components. On session expiry a single `queryClient.clear()` wipes
every cached response, so no data survives a sign-out.

## react-hook-form + zod

Forms keep their state out of React re-renders (RHF registers uncontrolled inputs) and validate
with zod schemas via `@hookform/resolvers` — the same validation idiom the server uses, so client
rules mirror contract rules (email shape, required fields). The sign-in form intentionally keeps
server validation authoritative: any 401 renders one generic message.

## Tailwind + own components instead of MUI

A component library would bring its own design language, theme engine and bundle weight, and the
assessment grades component organisation — hand-rolled `Button`/`Input`/`DataTable` over design
tokens (`src/styles/tokens.css`) shows that directly. Tailwind 4 reads the tokens through
`@theme`, so every class traces back to one CSS variable file and the dark theme is a variable
swap, not a rewrite.

## Radix primitives for accessibility only

Dialog, Select and Tabs are the three places where correct keyboard/focus/ARIA behaviour is
genuinely hard (focus trapping, typeahead, roving tabindex). Radix provides exactly that as
unstyled primitives; all visuals stay ours. Nothing else is imported from it, keeping the
dependency surface small.

## URL-synced list filters

`/tickets` keeps `status`, `priority`, `q`, `sort` and `page` in the query string via
`useSearchParams`. The URL becomes the single source of truth: refresh keeps your place, the back
button walks filter history, and a filtered view can be pasted into a chat ticket. Unknown or
invalid values are dropped on parse, so a hand-edited URL degrades to defaults instead of sending
garbage to the API (which would 400 on unknown keys).
