# Sanad Admin — design tokens and principles

An internal helpdesk tool for staff who live in it all day. Three words drive every decision:
**practical, dense, calm.** Information density beats whitespace; recognition beats decoration;
nothing animates, pulses or gradients. Colour is reserved for meaning (status, priority, danger) —
everything else is a quiet neutral scale so the meaningful colour stands out.

## 1. Colour tokens

Neutrals are a cool grey scale (slightly blue, never warm/cream). One accent for interactive
elements. Status and priority each get a **pair** (strong text/dot colour + soft background) so a
badge is legible without borders at 12px.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface-0` | `#ffffff` | `#1c2027` | cards, table rows, inputs |
| `--surface-1` | `#f5f6f8` | `#14171c` | app background |
| `--surface-2` | `#eceef2` | `#262b33` | hover rows, table header, pressed |
| `--border` | `#d9dde3` | `#333a44` | hairlines, input borders |
| `--text` | `#1f242e` | `#e7eaee` | primary text |
| `--text-muted` | `#5c6572` | `#9aa3af` | secondary text, meta, labels |
| `--accent` | `#3b5bdb` | `#748ffc` | buttons, links, focus rings, active nav |
| `--accent-hover` | `#364fc7` | `#91a7ff` | hover on accent |
| `--danger` | `#c92a2a` | `#ff8787` | destructive actions |

Status (text / soft background, light theme; dark theme uses the text colour at full strength on a
12% alpha background of the same hue):

| Status | Text | Background |
|---|---|---|
| `--status-open` | `#1971c2` | `#e7f1fb` |
| `--status-in-progress` | `#9a6700` | `#faf0d7` |
| `--status-resolved` | `#2b8a3e` | `#e6f4ea` |
| `--status-closed` | `#5c6572` | `#eceef2` |

Priority (same pair pattern; medium is teal, deliberately not the same blue as `open`):

| Priority | Text | Background |
|---|---|---|
| `--priority-low` | `#5c6572` | `#eceef2` |
| `--priority-medium` | `#0b7285` | `#e3f3f6` |
| `--priority-high` | `#d9480f` | `#fcebe3` |
| `--priority-urgent` | `#c92a2a` | `#fbe7e7` |

## 2. Typography

One family: the system UI stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`) —
zero font download, native rendering, right for a tool staff open 40 times a day. No serif, no
display face. Tabular numerals (`font-variant-numeric: tabular-nums`) on tables and stats.

Five steps (dense scale, 14px body):

| Step | Size / line | Use |
|---|---|---|
| `xs` | 12 / 16 | badges, table meta, requestId |
| `sm` | 13 / 18 | table cells, secondary UI |
| `base` | 14 / 20 | body, inputs, buttons |
| `lg` | 18 / 24 | page titles, dialog titles |
| `xl` | 24 / 30 | dashboard stat numbers only |

Weights: 400 body, 500 labels/nav/buttons, 600 titles and stat numbers. Nothing bolder.

## 3. Spacing, radius, elevation

- Spacing scale: **4, 8, 12, 16, 24, 32** (px). Table cells 8×12, cards 16, page gutters 24.
- Radius: **one value, 6px**, everywhere — buttons, inputs, cards and badges alike. No pill
  shapes; one value means one value.
- Elevation: borders, not shadows. Cards and tables are `--surface-0` with a 1px `--border`
  hairline on the `--surface-1` background. The only shadow in the app is on overlays
  (dialog, select popover, toast): `0 8px 24px rgb(15 20 30 / 0.16)`.

## 4. Layout

Left nav fixed 240px; content area max 1280px; tables bleed to the full content width.

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ Sanad        │  Tickets                                   [search………]       │
│              │  ────────────────────────────────────────────────────────    │
│ ● Dashboard  │  [Status ▾] [Priority ▾] [Category ▾] [Assignee ▾]  42 of 143│
│ ● Tickets    │ ┌───────────────────────────────────────────────────────────┐│
│ ● Categories │ │ Title            Requester  Category  Pri   Status   Last ││
│              │ ├───────────────────────────────────────────────────────────┤│
│              │ │ Cannot export…   Dana L.    Billing   High  Open     2h   ││
│              │ │ VPN drops on…    Omar K.    IT        Med   In prog  5h   ││
│   240px      │ │ …                                                         ││
│              │ └───────────────────────────────────────────────────────────┘│
│ ──────────   │                                   ‹ 1 2 3 … 8 ›              │
│ Omar Admin   │                                                              │
│ Sign out     │                    max-width 1280px                          │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

- Nav: flat list, 14px/500, active item gets `--surface-2` background + `--accent` text and a 2px
  accent bar on the left edge. Admin name + sign out pinned to the bottom.
- Page: `PageHeader` (title left, primary action right), then filters, then content. No breadcrumbs
  (the app is three screens deep at most).
- Dialogs centred, 480px, for create/edit category and confirmations only.

## 5. Interaction

- Focus: every interactive element shows a 2px `--accent` ring (`outline-offset: 2px`). Never
  removed, never colour-only.
- Buttons are verbs ("Save category", "Sign in"), sentence case, no icons-for-decoration, no arrows.
- Loading: skeleton rows match the real table geometry; buttons show an inline spinner and stay the
  same width. Errors always render message + Retry + `requestId` in `xs` muted type.
- Empty states are one title line + one sentence + at most one action. No illustrations.

## 6. Review against the generic-AI-dashboard tells (revision pass)

- **Cream + serif + terracotta** — avoided: cool grey neutrals, system sans only.
- **Near-black + neon** — avoided: dark theme is `#14171c`/`#1c2027` with desaturated accents
  (`#748ffc`), not neon on `#000`.
- **Identical rounded cards with the same grey shadow** — avoided: no card shadows at all;
  hairline borders carry the structure, and tables are full-bleed rather than boxed-per-widget.
  *Revised in this pass: dashboard stat tiles were initially spec'd as four shadowed cards; they
  are now a single bordered strip divided by hairlines.*
- **ALL-CAPS eyebrow labels** — avoided: labels are 13px/500 sentence case, muted colour instead
  of caps for hierarchy.
- **"→" on buttons** — avoided: buttons are plain verbs; the only glyphs in the app are sort
  carets, pagination chevrons and the dialog close ×.
- *Also revised: first draft had the accent on `open` status equal to the button accent
  (`#3b5bdb`); status-open is now `#1971c2` so "lots of open tickets" doesn't make the table look
  like a wall of links.*

Light is the default theme; the dark values above ship in `tokens.css` behind
`[data-theme="dark"]` so the toggle is a later, cheap addition.
