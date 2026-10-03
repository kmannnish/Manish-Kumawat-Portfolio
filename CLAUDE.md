# Portfolio — Manish Kumawat

Personal portfolio for a **Forward Deployed AI Engineer** (engineer + designer hybrid). Public site is read-only; a private admin panel controls 100% of the content.

> **This file is sent to the model on every request. Keep it under ~120 lines.**
> Detailed specs live in `docs/` and are read **on demand**, not loaded every session.
> Deliberately not using `@` imports here — that would load every doc into every
> request and defeat the purpose.

## Stack

Next.js (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth + Storage), Resend, Cloudflare Turnstile, Vercel.

## The three laws

1. **No hardcoded user-facing strings.** Every visible string resolves from the `copy` table via `t(map, 'key', fallback)`. Need new text? Add a `copy` row — never a literal in JSX. Same for images, video, documents, URLs, section order, and nav.
2. **RLS on every table, with an explicit policy.** RLS enabled but policy-less is a silently empty table. See the matrix in `docs/03-data-model.md` §3.
3. **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** Never in a file with `'use client'`, never behind a `NEXT_PUBLIC_` prefix.

## Design tokens — use these, never raw hex

```css
--paper: #EAEFE9;  --ink: #111A16;         --graphite: #596159;
--rule:  #D5D9D0;  --rule-strong: #7F867D; --signal: #2743E8;  --mark: #C8156B;
```

`--rule` is for **decorative** hairlines only (1.23:1 — invisible by design). Anything load-bearing, including the trace chart axis and gridlines, uses `--rule-strong` (3.21:1, clears SC 1.4.11). **Don't darken `--paper`** — it would push `--rule-strong` back under 3:1.

`--signal` carries all interactive state. **`--mark` has exactly three permitted uses:** the single most recent ongoing trace bar, the one `is_headline` metric on a project detail page, and the last-updated stamp. Work-index metrics use `--ink`, not `--mark`.

Per-project `accent_color` comes from the DB but must be chosen from the curated contrast-checked palette in `docs/02-design-direction.md` §2 — not a free colour picker.

Type: **Instrument Sans** (display, UI, data) + **Newsreader** (prose, loaded with the `opsz` axis). **No third family, no monospace** — numbers use `font-variant-numeric: tabular-nums`. Prose measure caps at `68ch`.

## Never generate these

- ALL-CAPS tracked eyebrow labels above headings
- Meta strings joined with middle dots (`Role · Company · 2024`) — use type-differentiated columns instead
- `WORD — fragment` labels with a spaced em dash
- `→` appended to link or button text (fine inside metric values: `4.2s → 610ms`)
- `01`/`02`/`03` markers on anything not genuinely sequential
- A single headline word accented in another colour or italic
- Identical rounded cards, one radius everywhere, same `rgba(0,0,0,.1)` shadow
- Gradient washes as decoration; tinted near-blacks (`#0B0B0B`, `#111`)
- Em-dash-heavy marketing copy
- **Motion:** fade-and-slide-up on section enter, hover-lift on every card, scroll counters, logo marquees, cursor-follow glows, parallax on decorative elements

## Motion budget

One orchestrated load sequence only: trace axis draws once, bars grow left-to-right, ~600ms total / 40ms stagger. **All other motion must answer a user action.** Ship the `prefers-reduced-motion` branch in the same change as the animation.

Dimming non-hovered list rows uses `opacity-70`, not `opacity-50`. **Text inside a dimmable row must be `--ink`, never `--graphite`** — graphite at 70% composites to 2.97:1, which fails even the 3:1 graphic threshold. Inside those rows, hierarchy comes from size and weight, not tint. `--graphite` is only for text that never dims.

## Conventions

```
middleware.ts          project root (Next.js requires it there) — gates /admin
app/(public)/          public site, incl. work/[slug] and archive
app/(admin)/admin/     admin panel
app/api/contact/       contact route handler (service role lives here)
components/ui/         primitives — PascalCase filenames
components/sections/   one file per section kind — PascalCase
lib/supabase/          server.ts | client.ts | admin.ts — lowercase
lib/queries/           all data access. Never query inline in a component.
lib/copy.ts            the t() helper
supabase/migrations/   numbered SQL migrations
supabase/seed.sql      realistic seed data
docs/                  specs (read on demand)
```

- Server Components by default. `'use client'` only for real interactivity, pushed to the leaf.
- Validate every input with Zod at the boundary.
- Schema changes are **new migration files**, never edits to an applied one.
- `alt` text is required on images, sourced from `media.alt_text`.

## Commands

```bash
npm run dev
npm run build          # must pass before any work is called done
npx tsc --noEmit       # must pass clean
supabase db reset      # re-apply migrations + reseed
supabase gen types typescript --local > lib/database.types.ts
```

## Do not touch

`.env`, `.env.local`, `.env.production` (but **do** create and edit `.env.local.example`), `lib/database.types.ts` (generated — regenerate instead), already-applied files in `supabase/migrations/`, `node_modules`, `.next`, lockfiles.

## Read on demand

| Working on | Read |
|---|---|
| Visual design, layout, motion | `docs/02-design-direction.md` |
| Schema, RLS, storage, policies | `docs/03-data-model.md` |
| What to build next | `docs/04-build-roadmap.md` |
| Why a pattern was chosen | `docs/01-reference-teardown.md` |

## Working style

Plan before editing anything non-trivial. State assumptions instead of guessing silently. If a request conflicts with the three laws or the banned-patterns list, say so rather than complying. Prefer editing an existing file over creating a new one. Don't write READMEs, summary docs, or tests unless asked.
