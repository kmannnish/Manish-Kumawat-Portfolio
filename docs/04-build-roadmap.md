# Build roadmap

Fifteen sessions. **One session per row, then `/clear`.** That discipline is the single biggest lever on both quality and token spend — see `05-claude-code-playbook.md` for why.

Two rows (S6 and S11) are genuinely too large for one sitting and are marked with an internal split point. Clear between the halves.

Each row gives you a prompt to paste and a done-check. Don't move on until the done-check passes; carrying a broken state forward is how small problems become expensive ones.

---

## Phase 0. Foundation (2 sessions)

### S1. Scaffold

> Set up a Next.js App Router project with TypeScript and Tailwind in this directory. Add the Supabase JS client and the Supabase CLI as a dev dependency, and run `supabase init`.
>
> Load fonts through `next/font/google` with `display: swap`: Instrument Sans, and Newsreader **with `axes: ['opsz']`** plus `font-optical-sizing: auto` — the optical size axis is the only reason that face was chosen, and `next/font` subsets it away unless you request it.
>
> Put the seven colour tokens and the `clamp()` type scale from `docs/02-design-direction.md` §2 into the Tailwind theme as named tokens, not arbitrary values. Create `lib/supabase/{server,client,admin}.ts` with the standard SSR helpers, and `lib/queries/` as an empty directory with a short comment explaining that all data access lives there.
>
> Create `.env.local.example` containing exactly the nine variables listed in `docs/03-data-model.md` §6, each with a comment. (`CLAUDE.md` forbids touching `.env` files but explicitly permits the `.example`.) Confirm `.env*` is gitignored except the example, and add `docs/references/` to `.gitignore` too — it holds saved copies of third-party sites for reading, which shouldn't be committed. Don't build any UI yet.

**Done when:** `npm run dev` serves a blank page in `--paper` with both fonts loading, Newsreader's `opsz` axis is actually present in the loaded font, and `npx tsc --noEmit` is clean.

### S2. Schema

> Read `docs/03-data-model.md` in full. Create numbered migration files under `supabase/migrations/`.
>
> Follow the table order in §2 exactly — `media` and `documents` must exist before `site_settings` and `projects`, which hold foreign keys into them. Include every enum, index, constraint, the `is_admin()` and `content_last_updated()` functions with their `security definer` and `search_path` settings, the `revoke execute` line, the `touch_updated_at()` trigger on every table carrying `updated_at`, the storage bucket inserts from §5, and the storage policies for insert, update and delete on both buckets.
>
> Implement the full RLS matrix in §3 — **all fifteen tables, each with an explicit policy**, including `admins`. Wrap every `is_admin()` call as `(select public.is_admin())`. Grant `anon` no policy at all on `contact_submissions`.
>
> Then write `supabase/seed.sql`: exactly one `site_settings` row, four projects each with well-formed `metrics` including one `is_headline: true`, three experience rows with **overlapping** date ranges, and a complete set of `copy` rows for every string the design calls for. Run `supabase db reset` and generate types into `lib/database.types.ts`.

**Done when:** `supabase db reset` applies cleanly and reseeds. Then verify, don't assume — query `pg_class` and assert `relrowsecurity` is true for all fifteen tables, and confirm with an anonymous client that you cannot select from `admins` or `contact_submissions`, and cannot insert into `projects`.

---

## Phase 1. Public site, on seeded data (7 sessions)

The whole public site gets built against the real schema with zero hardcoded strings, before any admin UI exists. The seed stands in for the admin panel, which means the schema is proven by real queries before CRUD is layered on top — avoiding the expensive rewrite.

### S3. Shell

> Build the public layout: the sticky left index rail, the thin top bar with `owner_name` and the live `currently` value from `site_settings`, and the footer with the real timestamp from `content_last_updated()`. Nav comes from `nav_items`.
>
> Implement `lib/copy.ts` with the `t()` helper that falls back safely on a missing key, and load the full copy map once in the layout as a Server Component. **Put every query in `lib/queries/`** — `CLAUDE.md` forbids inline queries in components, and this is the session that sets the precedent for the next twelve.
>
> Index rail uses scroll-spy with a position indicator, and collapses to a thin top progress line below `lg`. No section content yet.

**Done when:** the shell renders entirely from the database, nothing is hardcoded, every query lives in `lib/queries/`, and the rail tracks scroll correctly at both breakpoints.

### S4. Hero

> Build the hero from `docs/02-design-direction.md` §2: the display statement at the specified scale and tracking, left-aligned, capped at the prose measure, resolved through `t()`. No eyebrow label, no accented single word, no CTA button pair — the statement does the work. Leave vertical room below for the trace chart to begin inside the hero viewport.
>
> The `clamp()` floor is the load-bearing number, not the preferred value. alexcoven.com sizes display type in raw `vw` and its hero/body ratio measures 4.5× on desktop but **1.2× at 390px** — check ours actually holds its hierarchy at phone widths rather than only verifying the desktop end.

**Done when:** it matches the wireframe's proportions and reads well from 360px to 2560px, **and the display-to-body size ratio is still visibly a hierarchy at 390px.**

### S5. The trace chart. Give this its own session.

> Build the deployment trace component described in `docs/02-design-direction.md` §3.
>
> Horizontal duration bars for `experience` and featured `projects` on a shared time axis derived from the data's own min and max dates. Axis lines and gridlines use **`--rule-strong`**, not `--rule` — `--rule` sits at 1.23:1 and would make the axis invisible. Each bar uses its row's `accent_color`. Only the **latest-starting** row with a null `ended_on` gets `--mark`; other ongoing rows use their accent colour.
>
> Hovering a bar dims its siblings to **`opacity-70`** (not 50 — that drops `--ink` to 3.28:1) using the Tailwind named-group technique from `docs/01-reference-teardown.md` §1, and updates a detail panel below the chart. **No `--graphite` text inside a dimmable bar row** — at 70% it measures 2.97:1. Use `--ink` at a smaller size or lighter weight instead.
>
> One load animation only: axis draws in, then bars grow from the left, 600ms total with a 40ms stagger. Ship the `prefers-reduced-motion` branch in this same change. Below `lg`, rotate to vertical bars with the axis down the left edge — not a carousel. Bars are focusable and focus updates the detail panel.
>
> Trace labels are type-differentiated columns (organisation, then role, separated by space and weight). **Not** `Acme · staff eng` — middle-dot meta strings are banned.

**Done when:** it reads correctly with overlapping engagements, works on a phone, is keyboard-navigable, and is static under reduced-motion. **Take a screenshot and look at it** before calling it done.

### S6. Work. Two sittings — clear between them.

**Sitting A, the index:**

> Build the work index as a list of rows using the hover-dim (`opacity-70`) and full-row-hit-area patterns from `docs/01-reference-teardown.md` §1. Each row shows title, role, year range, tech tags from `project_tech`, and its `is_headline` metric from the `metrics` JSONB **in `--ink`** — `--mark` is reserved for detail pages. **All text in these rows is `--ink`**; the secondary items are differentiated by size and weight, not by `--graphite`, because graphite at 70% opacity fails contrast. Rows bleed past the prose measure per the wireframe.

**Sitting B, detail and archive:**

> Build `/work/[slug]` rendering problem → approach → outcome, the metrics block with tabular figures and the headline metric in `--mark`, the media gallery from `project_media` using `next/image` with `placeholder="blur"` from `media.placeholder`, and the project's `accent_color` as a scoped CSS custom property. `generateStaticParams` over **both published and archived** slugs — archived projects have detail pages too, and generating only published ones silently drops them to dynamic rendering.
>
> Then `/archive` as a real `<table>` — Year / Project / Made at / Built with / Link — with a sticky backdrop-blur head and columns dropped progressively at narrow widths. It lists **both published and archived** projects; the RLS policy in `docs/03-data-model.md` §3 permits both for exactly this reason.

**Done when:** every project is reachable, metrics render, images never cause layout shift, and the archive table degrades properly on mobile.

### S7. Remaining sections

> Build the about, skills, writing, and testimonials sections, rendering by iterating the `sections` table in `sort_order` and switching on `kind`, honouring `is_visible`. About is prose in Newsreader at the 68ch measure. Skills group by `tech.category` — no progress bars, no star ratings, no radar chart; just grouped names with featured ones distinguished typographically. Writing lists published `posts`. Testimonials are plain blockquotes, no carousel.

**Done when:** reordering a `sections` row in the database reorders the live page with no code change.

### S8. Contact

> Build the contact form (name, company, email, phone, message) posting to `app/api/contact/route.ts`. The handler runs server-side with the service role key and applies, in order: honeypot field, minimum time-on-form check, Zod validation, Cloudflare Turnstile verification, and a rate limit.
>
> Implement the rate limit as the Postgres count query in `docs/03-data-model.md` §3 — keyed on a `CONTACT_IP_SALT`-salted `ip_hash`, rejecting above five submissions per hour. Vercel functions are stateless and there's no KV in this stack, so in-memory counters silently do nothing.
>
> On success, insert into `contact_submissions` and send a notification via Resend. Store the hashed IP, never the raw one. Return field-level errors. Button says "Send message". Success and error states say what happened and what to do next — they don't apologise.

**Done when:** a real submission lands in the table and in your inbox, validation errors surface per field, and the honeypot blocks a scripted post. (Note Turnstile requires JavaScript, so a no-JS fallback isn't achievable here without dropping it.)

### S9. Polish

> Audit and fix: metadata and OG tags from `site_settings` and per-project SEO fields, dynamic OG image generation, `sitemap.ts`, `robots.ts`, JSON-LD Person schema.
>
> Then accessibility. Verify contrast with a real checker on **all of** `--graphite`, `--mark`, `--signal`, and `--rule-strong` against `--paper`. The table in `docs/02-design-direction.md` §2 claims 3.21:1 for `--rule-strong` and 4.77:1 for `--mark` — both are thin, both are computed rather than tool-verified, so confirm them. Also check the dimmed row state: `--ink` at `opacity-70` should read 6.10:1, and **no dimmable row should contain `--graphite` text at all**. Then: visible focus rings in `--signal`, correct heading order, labelled form fields, a skip-to-content link.
>
> Run a production build and Lighthouse. Report scores and fix anything below 95.

**Done when:** Lighthouse clears 95 across the board, every token's measured ratio is recorded, and a keyboard-only pass reaches every interactive element.

---

## Phase 2. Admin panel (5 sessions)

The schema is now proven by a working public site, so CRUD is mechanical. **Consider dropping to a cheaper model** (`/model`) for S11–S14 — repetitive form work, not architecture.

### S10. Auth

> Build Supabase email auth with a login page at `/admin/login` and **`middleware.ts` at the project root** (Next.js requires it there, not inside the route group) protecting every `/admin` route, checking membership in the `admins` table rather than just a valid session.
>
> Build the admin shell in `components/ui/`: sidebar nav, a consistent page header, a toast system, and a confirm-destructive-action dialog. Match the public site's tokens — this should look like the same product, not a bootstrap dashboard. Add a sign-out action.

**Done when:** a logged-out visitor hitting `/admin/anything` is redirected, and an authenticated non-admin is rejected.

### S11. Copy and settings. Two sittings — clear between them.

**Sitting A:**

> Build a `copy` editor grouped by `group_name`, showing each row's `label` and `help`, with the right input per `kind` — single-line, rich text, or markdown — and inline save with optimistic UI. Then a `site_settings` form for all fields, including the `currently` textarea, social links as a repeatable list, and the résumé document picker.

**Sitting B:**

> Build a `sections` manager with drag-to-reorder writing back to `sort_order` and a visibility toggle per section, then the same for `nav_items`. Pick a drag-and-drop library and tell me which — the stack list in `CLAUDE.md` doesn't include one, so this is a new dependency and should be a deliberate choice.

**Done when:** you can change the hero headline from the admin panel and see it live on the public site without touching code.

### S12. Projects and experience

> Build full CRUD for `projects` and `experience`. The project form needs: slug with auto-generation and a uniqueness check, markdown body with preview, a repeatable metrics editor (label / before / after / unit / **is_headline** radio), a repeatable links editor, tech multi-select writing to `project_tech`, date pickers with an "ongoing" toggle setting `ended_on` to null, and status draft/published/archived.
>
> `accent_color` is a **swatch picker over the six curated colours** in `docs/02-design-direction.md` §2 — not a free colour input. **Block publishing when `metrics` is empty**, with an error explaining why. Experience form mirrors it. Both lists support reordering.

**Done when:** a project created entirely through the admin panel appears correctly on the public site, in the work list, and as a bar on the trace chart.

### S13. Media and documents

> Build the media library: drag-and-drop upload to the `media` bucket, extracting width, height, byte size and mime type at upload, generating a blur placeholder, and **requiring alt text before an image can be saved**. Grid view with search, replace-file, and a delete that warns when the item is referenced by `project_media`, `projects.cover_media_id`, `site_settings.og_image_id`, `tech.icon_media_id`, `posts.cover_media_id`, or `testimonials.author_media_id`. A picker component usable from the project and settings forms. Then the same for `documents`, with label and version fields.
>
> Enforce file-type and size limits server-side, not just in the input element.

**Done when:** you can upload an image, attach it to a project, and see it render with a blur-up and no layout shift. Confirm an anonymous client cannot upload, and that replace and delete both work (they need the `update` and `delete` storage policies from S2).

### S14. Submissions inbox

> Build the contact submissions inbox: list with status filters, unread count badge, detail view, status transitions (new → read → replied → archived / spam), a notes field, a mailto reply action prefilling subject and greeting, and CSV export. Sort newest first. Empty state invites action rather than apologising.

**Done when:** a submission from the public form appears here, and status changes persist.

---

## Phase 3. Ship (1 session)

### S15. Deploy

> Deploy to Vercel. Set all nine environment variables for preview and production, confirming `SUPABASE_SERVICE_ROLE_KEY` is server-only and nothing sensitive carries a `NEXT_PUBLIC_` prefix. Connect the custom domain and verify the Resend sending domain via DNS.
>
> Add revalidation so admin edits appear publicly within seconds — tag-based `revalidateTag` fired from admin mutations, not a blanket short cache. Run a final production Lighthouse pass and verify the contact form end-to-end on the live domain.
>
> If the storage policies from S2 failed with an ownership error on the hosted project, create them now through the dashboard's storage policy editor.

**Done when:** the live URL works, the contact form delivers to your inbox, and an admin edit shows up publicly within seconds.

---

## Optional, later

Dark mode by inverting the token set. A `/uses` page. RSS for writing. Analytics. View-transition page changes. An `audit_log` table plus the `security definer` trigger that populates it, driving a public changelog.

Don't start any of these before S15 ships. A live imperfect portfolio beats a perfect local one.

---

## If you only have time for five sessions

**S1, S2, S3, S4, S5.** Foundation, shell, hero, trace chart. That's a complete-looking page with the one memorable element, and the design's whole thesis is that the statement is the hero — so skipping S4 would ship a site with no headline.

Add S8 as the sixth if you need the contact form live. Note its done-check wants a delivered email, which needs the Resend domain verified — normally an S15 task, so do that part early if you reorder.
