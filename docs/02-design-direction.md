# Design direction — "Instrument"

This is the design plan. It is opinionated on purpose. Read `01-reference-teardown.md` first for where the patterns come from.

---

## 1. The brief, stated plainly

**Subject:** Manish Kumawat — Forward Deployed AI Engineer. Engineer *and* designer, which is an unusual pair and is the thing to sell.

**Audience:** hiring managers and founders at AI labs and scale-ups, plus CTOs evaluating him for deployment work. They are technical, they skim, and they have seen two hundred portfolios this quarter.

**The job the page must do:** convince a technical reader, in under thirty seconds, that this person can walk into a customer's messy environment, understand a real problem, and ship an AI system that measurably works, and that it will look good when he's done.

**Where the visual language comes from.** Not from "AI" imagery. Neural-network node graphs, glowing orbs, and purple gradients are the vernacular of AI *marketing*, not AI *engineering*, and a technical audience reads them as a tell. The real vernacular of forward-deployed work is **instrumentation and field deployment**: traces, durations, p95 latencies, eval scores, overlapping engagements, before-and-after numbers. That is where the design devices come from.

---

## 2. Tokens

### Colour

```css
:root {
  --paper:       #EAEFE9; /* green-grey paper. Clearly not cream — see §4 */
  --ink:         #111A16; /* deep green-black. Chromatic, not a tinted neutral */
  --graphite:    #596159; /* sage grey. Secondary text, captions */
  --rule:        #D5D9D0; /* DECORATIVE hairlines only — 1.23:1, invisible by design */
  --rule-strong: #7F867D; /* load-bearing lines: chart axis, gridlines. 3.21:1 */
  --signal:      #2743E8; /* saturated true blue. All interactive state */
  --mark:        #C8156B; /* annotation magenta. Exactly 3 uses — see below */
}
```

**The `--rule` / `--rule-strong` split matters.** A single rule colour is the usual approach and it quietly fails accessibility: `--rule` sits at 1.23:1 against paper, which is correct for a decorative divider and useless for a chart axis. WCAG 2.2 SC 1.4.11 requires 3:1 for non-text content that conveys information, and the trace chart's axis *is* the information. Decorative lines get `--rule`; anything you need to read gets `--rule-strong`.

`--rule-strong` was originally `#848B82`, which measured 3.13:1 against the older, lighter paper. Darkening paper to `#EAEFE9` dropped it to **3.005:1** — still passing, by five thousandths, which is not a margin. It's now `#7F867D` at 3.21:1. The lesson worth carrying: **changing `--paper` invalidates every ratio in the table below**, and `--rule-strong` is the token with the least room.

**`--mark` has exactly three permitted uses**, and they are enumerated rather than budgeted, because a numeric cap can't survive data-driven rendering:

1. The **single most recent** ongoing trace bar. Not every bar with a null `ended_on` — if three engagements are concurrent, only the latest-starting one is marked.
2. The one metric flagged `is_headline`, **on a project detail page only**. Work-index metrics use `--ink`.
3. The last-updated stamp in the footer.

Measured contrast ratios against `--paper` `#EAEFE9`, computed rather than estimated. **Re-verify in S9 with a real checker** — and recompute from scratch if paper ever changes:

| Token | vs paper | Body 4.5:1 | Large / graphic 3:1 |
|---|---|---|---|
| `--ink` | 15.23:1 | pass | pass |
| `--signal` | 5.90:1 | pass | pass |
| `--graphite` | 5.50:1 | pass | pass |
| `--mark` | 4.77:1 | pass (thin margin) | pass |
| `--rule-strong` | 3.21:1 | fail (by design) | pass |
| `--rule` | 1.23:1 | fail | fail (decorative only) |

**Opacity is not free.** The hover-dim pattern at `opacity-70` is safe for `--ink` text — it composites to `#525A55`, 6.10:1. It is **not** safe for `--graphite`, which composites to `#848C84` at **2.97:1**, failing even the graphic threshold. So inside any row that can be dimmed, secondary information is `--ink` differentiated by size and weight, not by tint. `--graphite` is reserved for text that never dims: prose captions, standalone meta, admin helper text.

### Per-project accent colours

`projects.accent_color` and `experience.accent_color` exist because of the vanschneider.com lesson in `01-reference-teardown.md` §2 — each project claiming its own colour makes a small body of work feel like chapters rather than a grid.

But a free colour picker in the admin panel breaks the palette and can break contrast. So the admin UI offers **this fixed set only**, as a swatch picker. These are **graphic fills** — bar colours and scoped backgrounds — and are never used for body text:

```
#1C6B52  deep green       #4A5A1E  olive
#8A4B1F  burnt umber      #5B3FA8  violet
#A8321C  brick            #2B6A8F  steel blue
```

Measured against paper as graphic fills: 5.50, 6.50, 5.80, 6.62, 5.74, 5.06 — all well clear of 3:1, and all clear 4.5:1 too, so they stay legible if one ever does carry a large label. Store the hex in the column; constrain the choice in the form.

**`--signal` `#2743E8` is deliberately not in this list.** An earlier draft included it, which would have let a project's bar render in the exact colour reserved for interactive state — making a static bar look clickable. Interactive blue belongs to `--signal` alone; olive took its place in the palette.

Dark mode is **phase 2**. The palette inverts to an `--ink` base, but don't build it until the light theme is finished — maintaining two themes while the design is still moving doubles the work for no gain.

### Type — two families, roles kept strictly separate

| Role | Family | Why |
|---|---|---|
| Display, UI, data | **Instrument Sans** | Variable grotesque (weight + width axes), OFL, genuinely underused. Slightly technical letterforms without being a "tech font." |
| Prose, case studies | **Newsreader** | Variable serif with a real optical-size (`opsz`) axis, so it holds from caption to pull-quote. OFL. Excellent on screen. |

The `opsz` axis is the entire reason Newsreader was chosen, so it has to actually be loaded: `next/font/google` subsets to the axes you request, which means passing `axes: ['opsz']` and setting `font-optical-sizing: auto`. Load it without that and you've shipped a font without the feature it was picked for.

**No third family, and specifically no monospace.** Numbers in the trace chart and metric blocks use Instrument Sans with `font-variant-numeric: tabular-nums`. Reaching for a mono face to label small data is one of the most reliable signals of a templated page, and tabular figures solve the actual alignment problem it pretends to solve.

Scale is a perfect fourth (1.333), fluid via `clamp()`:

```css
--step-display: clamp(2.75rem, 6vw, 5.25rem);  /* 500 wt, -0.03em, lh 0.98 */
--step-h2:      clamp(1.75rem, 3vw, 2.5rem);   /* 500 wt, -0.02em, lh 1.1  */
--step-h3:      1.3125rem;                      /* 500 wt, -0.01em, lh 1.25 */
--step-body:    1.125rem;                       /* Newsreader, lh 1.65      */
--step-small:   0.9375rem;
--step-data:    0.875rem;                       /* tabular-nums             */
```

**Why `clamp()` and not raw `vw`.** alexcoven.com sizes its display type in bare `6vw` / `5.5vw` / `4.5vw` against a fixed 19px body, and the measured consequence is that the hero/body ratio falls from 4.5× at 1440px to **1.2× at 390px** — the hierarchy nearly collapses at exactly the width most visitors arrive on (`01-reference-teardown.md` §5). `clamp()` keeps the fluid middle term and adds the floor and ceiling that raw `vw` throws away. The `2.75rem` floor is the number that actually matters here; check it on a phone, not just in a resized desktop window.

Prose measure caps at **68ch**. Newsreader gets the generous 1.65 line-height a serif needs on screen. Note this is a **departure** from vanschneider.com, not an inheritance — his widths are a viewport-relative `calc(100%/12*n)` grid with no reading measure at all, so prose runs long on a wide monitor.

### Layout

Left **index rail** — narrow, sticky, showing section names and a position indicator. Content sits in an off-centre measure to its right. Work rows deliberately **bleed past the prose measure**, so the page has two rhythms: a calm reading column and a wider data column.

This is *not* the symmetrical 50/50 split from brittanychiang.com. That layout is excellent and has been cloned several thousand times.

Alignment is **left throughout** — no centred body copy, no justified text. The single exception is the trace chart, which aligns to its own time axis.

```
┌───────────────────────────────────────────────────────────────┐
│ Manish Kumawat              Currently: shipping eval harness…  │  ← thin bar, name + live "Currently"
├─────┬─────────────────────────────────────────────────────────┤
│     │                                                          │
│  i  │   Forward deployed. I move into your stack               │  ← statement IS the hero
│  n  │   and leave behind something that                        │     (display, 68ch max, left)
│  d  │   measurably works.                                      │
│  e  │                                                          │
│  x  │   ── 2021 ─────────── 2024 ─────────── 2026 ──────────   │  ← trace begins in the hero
│     │   ▓▓▓▓▓▓▓▓▓▓▓▓          Acme        staff engineer       │     viewport, inviting scroll
│  r  │          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Globex      forward deployed    │
│  a  │                     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Initech    lead  ◆   │  ← ◆ = --mark, latest ongoing
│  i  │                                                          │
│  l  ├──────────────── prose measure (68ch) ───────┐            │
│     │   Selected work                              │            │
│     │                                              │            │
│  ●  │   Latency teardown, 40-seat support desk     │  4.2s→610ms│  ← rows bleed past the
│  ○  │   Eval harness for a multi-tenant RAG stack  │  +31% acc. │     prose measure
│  ○  │   On-prem inference, air-gapped environment  │  0 egress  │
│     └──────────────────────────────────────────────┘            │
└─────┴─────────────────────────────────────────────────────────┘
```

**The wireframe is subject to §6.** Note the trace labels are *type-differentiated columns* — organisation then role, separated by space and weight — not `Acme · staff eng`. Middle-dot meta strings are banned in §6, and the chart's own grid gives you columns for free.

On narrow viewports the index rail collapses to a thin progress line at the top, and the trace chart rotates to vertical bars with the time axis down the left edge. It does not become a carousel.

---

## 3. The one bold element: the deployment trace

Every portfolio has a timeline. Almost all of them are a vertical line with dots, which throws away the two most interesting facts about a career: **how long** each engagement ran, and **where they overlapped**.

Render experience and featured projects as horizontal duration bars on a shared time axis — a trace waterfall, the same device an engineer reads in a profiler. Tenure, concurrency, and trajectory in one glance. Hovering a bar updates a detail panel below it; siblings dim to `opacity-70` using the named-group technique from `01-reference-teardown.md` §1.

Four reasons this earns its place as the one risky move:

1. **It's information-bearing, not decorative.** The skill of reading it transfers directly from tooling the audience uses daily.
2. **It's the native idiom of the job.** A forward-deployed engineer lives in traces.
3. **It's hard to do well**, so doing it well is itself the proof of craft — and it is **quarantined to one component**, which is the one Lynn Fisher principle that survived measurement (`01-reference-teardown.md` §3). Her recomposing CSS self-portrait, which an earlier draft of this doc cited as the precedent here, **is not on the current version of her site**; the containment discipline is real, the specific precedent wasn't. The trace chart stands on reasons 1, 2 and 4 regardless.
4. **It's fully data-driven.** Every bar is a row in `experience` or `projects`. It is simultaneously the most memorable thing on the site and the best argument for why the admin panel exists.

Everything else stays deliberately quiet so this can be loud.

---

## 4. Review pass — what I changed and why

The discipline here is to draft a plan, then interrogate it for anything that's a default rather than a choice. Seven things failed that test.

**Dark navy base with a mint or cyan accent.** My first instinct, and it is simultaneously the "near-black with one bright accent" cliché *and* a direct clone of brittanychiang **v4**. Measurement sharpened this one: `#0a192f` and `#64ffda` appear **zero times** on her current site (`01-reference-teardown.md` §1), so that palette is something its own author moved on from while the clones kept shipping it. Changed to a light base. Going light for an engineer portfolio is differentiating on its own, and it's the harder choice — dark backgrounds hide imprecise spacing and muddy type, light ones expose both. Choosing light is itself a claim about craft.

**Cream paper — and then a fake fix.** `#F4F1EA`-adjacent warm cream is the most recognisable AI-generated background right now. My first correction was `#F1F3EE`, which I described as "cool oat, measurably cooler and greener." That claim didn't survive checking: `#F1F3EE` sits at ΔE76 ≈ 2.1 from cream, around the just-noticeable-difference threshold and indistinguishable as a full-page background.

**`--paper` is now `#EAEFE9`.** Being precise about what that did and didn't achieve, since the whole point of this section is not to let a claim pass unchecked:

| | L\* | a\* | b\* | ΔE76 from cream |
|---|---|---|---|---|
| cream `#F4F1EA` | 95.20 | −0.21 | +3.73 | — |
| rejected `#F1F3EE` | 95.57 | −1.54 | +2.17 | 2.08 |
| **`#EAEFE9`** | 93.93 | −2.73 | +2.32 | **3.15** |

The move is real on two axes: a\* nearly doubles in the green direction (−1.54 → −2.73) and L\* drops 1.6, so it reads as a green-grey paper rather than a white. It is **not** real on the blue–yellow axis — b\* is +2.32, marginally *more* yellow than the colour I rejected partly for having positive b\*. So "green-grey" is defensible and "cool" is not; the word doesn't appear in the token comment. ΔE76 3.15 against cream is about one JND past the threshold I called indistinguishable — better, not categorically different. The honest summary is that this is a modest, defensible shift, not a dramatic one, and the differentiation in this design is carried by type, layout and the trace chart rather than by the background hex.

It also had a cost: darkening paper pushed `--rule-strong` from 3.13:1 to 3.005:1, which is why that token changed too. Noted in §2.

**Serif display over sans body.** The standard cliché pairing. Inverted it: sans display, serif prose. This also serves the content better, since case studies are long enough to want a proper reading face.

**Inter or Geist for display.** Both good, both the house default in developer circles, which makes them invisible — brittanychiang.com's current version loads Inter through `next/font`, confirming the point. Instrument Sans does the same job with more character.

One thing measurement *added* to this section rather than corrected: alexcoven.com runs a single family at weights **300 and 350** — two weights close enough to be nearly indistinguishable — so all its hierarchy comes from size rather than weight (`01-reference-teardown.md` §5). That's more disciplined than the reflexive light/bold pairing, and it's a useful check on our own scale: if a level in the type scale only reads as distinct because of its weight, the size step is probably too small.

**A monospace family for data labels.** Nearly shipped this before catching it — an explicitly templated tell. Tabular figures in the display face solve the alignment problem without the costume.

**A vertical timeline with dots for experience.** Replaced with the trace waterfall, for the reasons in §3.

**One rule colour.** Caught during review: a single `--rule` at 1.23:1 is right for dividers and makes the trace chart's axis invisible — the one element the whole design is built around. Split into `--rule` and `--rule-strong`.

One thing kept despite being common: the hover-dim list. It's widely used because it's genuinely good — zero JS, no layout shift, rewards attention. Ubiquity isn't laziness when the mechanism is sound. But it ships at `opacity-70`, not the usual `opacity-50`, because 50% drops `--ink` text to 3.28:1 and dimmed rows are still content people read. The second-order consequence took another pass to catch: at 70% `--graphite` lands at 2.97:1, so dimmable rows can't use graphite at all — see the opacity note in §2.

---

## 5. Motion rules

**One orchestrated load sequence, and nothing else automatic.** On first paint the trace axis draws in once and the bars grow from the left in a single staggered sweep — roughly 600ms total, 40ms between bars. That is the entire non-interactive motion budget for the page.

After that, motion only answers something the visitor did: sibling dimming on list hover, the detail panel syncing to the hovered bar, view transitions into a project, the index rail tracking scroll.

**Explicitly banned:** fade-and-slide-up on section enter, hover-lift on every card, counters that animate on each scroll-in, scrolling logo marquees, parallax on decorative elements, cursor-following glows.

Under `prefers-reduced-motion: reduce`, bars render at final width immediately, the axis is static, and view transitions become instant cuts. Build this alongside the animation, not afterwards — retrofitting is how it gets skipped.

---

## 6. Prohibited patterns

Reproduced in full in `CLAUDE.md`, so it's in front of the model every session. If you edit one list, edit both.

- ALL-CAPS tracked-out eyebrow labels above headings
- Meta strings joined with middle dots (`Role · Company · 2024`) — use type-differentiated columns
- `WORD — fragment` labels built with a spaced em dash
- `→` appended to link or button text (fine inside metric values: `4.2s → 610ms`)
- `01` / `02` / `03` markers on anything not genuinely sequential
- A single headline word accented in a different colour or italic
- Identical rounded cards with one radius everywhere and the same `rgba(0,0,0,.1)` shadow
- Gradient washes as decoration; tinted near-blacks (`#0B0B0B`, `#111`) standing in for ink
- Em-dash-heavy marketing copy
- The six banned motion patterns in §5

---

## 7. Copy rules

Write in the first person, in Manish's voice, and be concrete. "I move into your stack and leave behind something that measurably works" does a job. "Passionate about leveraging AI to build innovative solutions" does not.

Every project needs a number. **The admin form requires at least one metric before a project can be published** — enforced there rather than in the schema, for the reasons in `03-data-model.md` §2. `4.2s → 610ms at p95` beats any adjective available.

Name things the way the reader thinks about them. Buttons say what happens: "Send message," not "Submit." Empty states in the admin panel invite action rather than apologising. Errors say what broke and what to do next.

No filler, sentence case throughout, and when in doubt cut the sentence.

### Where `site_settings` fields render

Stated here so nothing in the schema is an orphan:

| Field | Renders |
|---|---|
| `owner_name` | top bar, footer, JSON-LD |
| `role_title` | `<title>`, OG tags, JSON-LD — not visible on the page |
| `tagline` | meta description fallback, OG description |
| `currently` | top bar, live |
| `location` | footer |
| `contact_email` | contact section, mailto |
| `social_links` | footer |
| `resume_document_id` | "résumé" link after the trace chart |
| `og_image_id`, `seo_*` | metadata only |
