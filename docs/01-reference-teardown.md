# Reference teardown — what to take from each site

**Provenance.** All five sites were captured with **Save Page As → "Webpage, Complete"** on **2026-10-02** into `docs/references/`, and everything below was read out of that markup and CSS. Where a claim is measured, it says so. Where the capture can't answer the question, it says that instead of guessing.

**What was captured:** the **homepage of each of the five**, 72 MB total. **What wasn't:** `brittanychiang.com/archive` and `lynnandtonic.com/about/` — both are separate URLs and neither is in the capture set, so claims about those two pages specifically are marked as uncaptured rather than stated as fact.

An earlier draft of this file was written from recall, without network access. Re-deriving it from the markup **contradicted six of its claims outright**, including two that had already propagated into the design and the roadmap. Those corrections are called out inline, because the pattern of error is itself useful: almost every one was a case of remembering a site's *reputation* instead of its *current state*.

> One artefact to ignore: the Lynn Fisher capture contains `<style id="mytempCss">`, which is browser-extension injection introduced by the save. It is not her CSS and is not evidence.

---

## 1. brittanychiang.com — the structural template

**Measured:** 68 KB of HTML, 2.8 MB total. Next.js + Tailwind, Inter loaded through `next/font`.

Two generations are in circulation and people conflate them. **v4** (Gatsby, ~2019–21, navy + mint) is the one cloned into oblivion. The **current** version is the two-column one, and it is what the capture shows.

Structure is a single page in two columns. Left is a sticky bio panel — name, role, one-line tagline, scroll-spy nav, social icons pinned at the bottom. Right is the scrolling content: About → Experience → Projects → résumé link → footer. The left panel is sticky only at `lg:` and above; below that it stacks and scrolls normally.

**Correction — the famous palette is gone.** `#0a192f` and `#64ffda`, the navy-and-mint pair that the v4 clones are built on, occur **zero times** in the current markup. The live site is stock Tailwind `slate` and `teal` on `bg-slate-900`. The thing everyone copies from this site is two generations out of date, and copying it means copying a palette its own author has already abandoned. This makes the "don't take the palette" advice stronger than I first put it: there is nothing to take.

**The three mechanisms worth stealing, verified in the markup:**

| Pattern | Mechanism |
|---|---|
| **Hover-dim lists** | Tailwind named groups. The `<ol>` is `group/list`, each row carries `lg:group-hover/list:opacity-50`, and the hovered row overrides with `lg:hover:!opacity-100`. Siblings fade, target stays lit. Zero JS, no layout shift, scales to any list length. **Use `opacity-70` in our build, not the `50` shown here** — see the note below. |
| **Card bleed on hover** | A background card fades in behind the hovered row, inset with *negative* margins so it extends past the text column. The row feels like it lifts out of the list. |
| **Full-row hit area** | An absolutely positioned `<span class="absolute -inset-x-4 -inset-y-2.5">` over each row. The whole block is clickable while the semantic link stays on the title. |

**Not captured: the archive table.** `/archive` is a separate URL and isn't in the capture set. From prior knowledge it's a real `<table>` — Year / Project / Made at / Built with / Link, sticky `<thead>`, columns progressively dropped at narrow widths — and that is still the right pattern for us, but treat the specifics as unverified. `docs/04-build-roadmap.md` S6 Sitting B specs our version from first principles rather than from this page, so nothing downstream depends on the detail. If you want it measured, save `brittanychiang.com/archive` into `docs/references/01-brittanychiang/` and it can be checked.

**Take:** the three verified mechanisms. They're pure CSS and they make a modest body of work feel considered. One adjustment: dim to `opacity-70`, not `50`. At 50% the non-hovered `--ink` text falls to 3.28:1 against our paper, and dimmed rows are still content people read. Related constraint from `02-design-direction.md` §2: dimmable rows can't use `--graphite` for secondary text at all, because 70% of graphite composites to 2.97:1.

**Don't take:** the two-column 50/50 split itself — it's excellent and it has been cloned several thousand times, which is why `02-design-direction.md` uses an asymmetric index rail instead. Also skip the cursor-following radial spotlight; it's decoration that costs a mousemove listener and timestamps the site.

---

## 2. vanschneider.com — editorial voice

**Measured:** 720 KB of HTML, 20 MB total — by markup weight the second-heaviest of the five.

Light, editorial, aggressively first-person. Oversized intro statement in his own voice → work as large colour-blocked tiles → about/now → long-form writing → newsletter CTA → "say hello."

**Measured: the display type is `11.11rem` on an 18px root — 200px.** The root is set explicitly (`html { font-size: 18px }`), body copy runs `1.111rem`–`1.278rem` (20–23px), so the display-to-body ratio is **roughly 8.7×**. That is far past the usual 2–3× and it is the single most distinctive thing about the page. It works because the copy is genuinely good; at that scale a weak sentence has nowhere to hide.

> An earlier draft of this file put the ratio at 7.2×, which was wrong in the *conservative* direction — a reminder that a remembered number can be wrong without looking wrong. Also worth noting: `.hp-title` (72px, Inter 700) exists in the CSS but appears **zero times** in the homepage markup, so don't measure from the first large value you find.

**Correction — there is no reading measure.** I had credited him with setting essays at "a comfortable reading measure." The markup doesn't support that: widths are a viewport-relative twelve-column grid, `calc(100%/12*n)`, used well over a hundred times, and there is **not a single `ch`- or `em`-based `max-width` in the stylesheet.** So line length tracks the window rather than the font, and on a wide monitor the prose runs long. Our 68ch cap is a **departure** from this site, not a lesson learned from it — worth knowing, because the earlier draft implied we were following him.

**Also measured: 33 `@font-face` declarations across 11 distinct families** — Tobias (in sixteen weights and styles), MaisonNeue, Inter, Bodoni, BauerBodoni, EngraversGothic, EngraversGothicBT, EngraversRomanBT, FKRomanText, nb_akademie and nb_architekt. That's a real performance cost and a real consistency risk, and it's only survivable because the site is art-directed page by page. `02-design-direction.md` holds us to two families for exactly this reason.

**Take two things.** First, **per-project colour identity** — each case study claims its own background colour, so scrolling the work section feels like flipping chapters instead of scanning a uniform grid. This is cheap for us: one column on the project record. Second, **writing as a real section** rather than a dead `/blog` link.

**Don't take:** art-directing every project page. It looks superb and it is a permanent maintenance tax — every new project becomes a design project, which is exactly the trap the admin panel exists to prevent. Don't take the twelve-family font stack. And don't take display-size-at-all-costs; at his scale the intro statement *is* the hero, and that only works if the copy earns it.

---

## 3. lynnandtonic.com — craft as proof

**Measured:** **8 KB of HTML, 44 KB total.** Compare Marble's 30 MB. This is the most quietly radical fact in the whole capture set.

**Correction — the CSS self-portrait is not there.** I had this site down for a CSS self-portrait that *recomposes* across five to seven breakpoints, reassigning the same elements to new roles as the viewport widens, and I built a design principle on top of it: "make the breakpoint a reward." The current version — **version XIX** — has **no portrait at all** and **does not recompose**. It is a roughly fifteen-word typographic homepage.

She redesigns annually and keeps every past version, so the portrait may well have existed in an earlier one. But I can't verify that from this capture, and the honest position is that **the principle was recalled, not observed.** It is still a good principle. It should just be owned as ours rather than attributed to a page that doesn't currently do it.

What version XIX actually demonstrates is **subtraction**: 8 KB, no framework, no build output, no images, and it is still unmistakably hers. The craft signal isn't the trick — it's the confidence to ship almost nothing. That lands differently from what I originally wrote, and arguably harder.

The second principle from the earlier draft survives intact and matters more: **the weirdness is quarantined.** Whatever the experiment is in a given year, it's contained to one place. That containment is why her work reads as intentional rather than random, and it's the reason `02-design-direction.md` spends its entire risk budget on one component.

**Not captured:** `/about/`, which is the URL originally cited and a different page from the one saved. If the about page is where the illustration lives, saving `lynnandtonic.com/about/` into `docs/references/03-lynnandtonic/` would settle it.

**Take:** one contained moment of genuine delight that demonstrates skill without claiming it — and the discipline of shipping less markup than you think you need.

**Don't take:** building a CSS portrait. Hundreds of lines of hand-tuned positioning that breaks on any font or spacing change, and it's distinctively hers, so cloning it reads as theft rather than homage.

---

## 4. marblecontentmarketing.com — conversion mechanics

**Correction — the platform.** I guessed "almost certainly a Webflow or Framer agency build." It is **WordPress**: a custom theme at `wp-content/themes/marble`, with WPML 4.9.7, Gravity Forms, jQuery and reCAPTCHA, using Tailwind utility classes and `swup` for page transitions. 236 KB of HTML and **30 MB** of assets — the heaviest capture of the five by total weight.

**Correction — there are no numbers.** This is the one that matters, because it was load-bearing. I claimed this category of site "frames results as numbers before narrative," and used Marble as the source for our metrics-first discipline. A scan of the homepage's visible text for percentages, multipliers and magnitude suffixes returns **nothing**. There are no statistics on the page at all.

**Correction — there is no social proof.** I claimed it "sits high on the page." There are **zero** testimonials, blockquotes or review markers in the capture.

The homepage has exactly **three headings**: "What we've been up to" (h4), "Jobs at Marble" (h4), and "Request an offer" (h2). The structure is a nav, a marquee, a case-study carousel, a jobs block, and a CTA. That's it.

**On the agency tells I warned against, the evidence splits:**

| Tell | Present? |
|---|---|
| Scrolling marquee | **Yes** — 126 hits. But it's a *wordmark* marquee (the word "Work" with arrow glyphs) and a scrolling row of `VISIT` / `CALL` / `EMAIL` contact links, **not** a client logo wall. |
| Carousel | **Yes** — Swiper, 10 slides. It's the **case-study** carousel, not a testimonial carousel. |
| Scroll-triggered counters | **No.** No counter, odometer or count-up library. |
| `01` / `02` / `03` process section | **No.** No numbered process markers anywhere. |

So the site is **leaner than the agency stereotype I projected onto it**, and two of my four warnings weren't describing this page at all. The CTA discipline does hold up: one primary action, "Request an offer," plus "View case" repeated identically across all ten cards rather than varied per card.

**Take: the case-study skeleton — problem → approach → measured outcome — and the requirement that at least one metric exists before a project can be published.** Keep this. But **own it as our decision**, not as something observed here, because the measured outcome is precisely the part Marble doesn't do. `4.2s → 610ms at p95` is worth more than three paragraphs of description, and this single discipline is what separates a credible engineer portfolio from a list of side projects. (Required in the admin form, not the schema — `03-data-model.md` §2 explains why a JSONB check constraint is the wrong tool.)

Also take the repeated-identical-CTA habit. Varying the wording per card feels more crafted and measurably isn't.

**Don't take:** the weight. 30 MB for five headings' worth of content is the actual lesson of this capture, and it's a cautionary one.

---

## 5. alexcoven.com — restraint, measured

**Measured:** Next.js with **Sanity** as the CMS (`cdn.sanity.io`, 478 references). 4.5 MB of HTML — the Sanity payload is inlined into the document. 1,149 `<div>`s against 26 `<p>`s, which is worth sitting with: the page *looks* minimal and its markup is anything but.

**Correction — there is no "Currently" block.** I wrote that this site's useful contribution was "a current-focus framing that tells you what he's actually doing *right now*," and called a database-driven "Currently" block "the highest-signal element you can put on a portfolio." The word `currently` occurs **zero times** in the capture. There is no now-page, no current-focus block, and no freshness stamp. The nav is Contact and Instagram; the links out are Whatever Studio, Spritzi, and Featured Branding.

I invented the attribution. The idea is still good — see the last section, where it's now filed as ours — but it isn't from here.

**What the site actually does, and it's better than what I credited it with:**

**One typeface, two adjacent weights.** TWK Lausanne, self-hosted woff2, at weights **300 and 350** plus matching italics. Not 300 and 700 — 300 and 350, two weights close enough that most readers would struggle to tell them apart side by side. All visible hierarchy therefore comes from **size**, not weight. That is a much harder and more disciplined choice than the usual light/bold pairing, and it's the single most instructive thing in this capture.

**No accent colour at all.** The full palette is `#fff`, `#1a1a1a`, and three greys (`#f0f0f0`, `#e5e7eb`, `#9ca3af`, `#a6a6a6`). Monochrome, with no highlight hue anywhere.

**Third person, not first.** The bio opens "Alex Coven is a freelance designer, partner of Whatever Studio, Co-Founder at Spritzi." Worth flagging because `02-design-direction.md` §7 mandates first person for us — a deliberate divergence, not an oversight.

**Three plain label-and-list columns:** Services, Clients, Recognition. The clients — Blakesville Creamery, BP, Curtis Harding, DC Comics, Garrett's Popcorn, Microsoft, Spritzi, Tazo Tea, Teddy Baldassarre, Uber, Up Club, Universal Diamonds — are set as a **plain alphabetical text list, not a logo wall.** For a designer with genuinely recognisable clients, choosing type over logos is a flex, and it sidesteps the grey-logo-grid cliché entirely.

**Take:** the one-family/two-adjacent-weights discipline, and clients-as-text. Both are directly applicable.

**Don't take: the viewport-relative display type.** Headings are sized in raw `vw` and `dvw` — `6vw`, `5.5vw`, `4.5vw`, `4.5dvw` — against a fixed `1.1875rem` (19px) body. Running the numbers:

| Viewport | `6vw` display | vs 19px body |
|---|---|---|
| 1440px | 86.4px | **4.5×** |
| 1024px | 61.4px | 3.2× |
| 390px | 23.4px | **1.2×** |

On a phone the hero is barely larger than body copy — the type hierarchy nearly collapses at exactly the width where most visitors arrive. This is the concrete argument for the `clamp()` scale in `02-design-direction.md` §2: a floor, a preferred viewport-relative value, and a ceiling. Raw `vw` gets you the fluid part and throws away both guardrails.

Breakpoints are stock Tailwind (640 / 768 / 1024 / 1280 / 1536), as on brittanychiang.com.

**Don't take:** minimalism as an excuse for withholding information. Restraint in *form*, not in substance.

---

## Synthesis — one contribution each, after measurement

| Site | The one thing | Where it lands in your build |
|---|---|---|
| brittanychiang.com | Hover-dim lists, card bleed, full-row hit areas *(all verified in markup)* | Work index, experience list |
| vanschneider.com | Per-project colour identity; writing as first-class | `projects.accent_color`; Writing section |
| lynnandtonic.com | Quarantine the risk to one component; ship less markup than feels safe | The deployment trace, and nothing else |
| marblecontentmarketing.com | Problem → approach → outcome; one CTA repeated identically | `projects.metrics`; "Send message" / "View case"-style consistency |
| alexcoven.com | One family, two adjacent weights — hierarchy from size, not weight; clients as text | Instrument Sans weight range; no logo wall anywhere |

## What none of them do, and you should

This is also where the two ideas I mis-attributed now live, because the architectural case for them stands on its own and doesn't need a borrowed pedigree.

- **A visible "last updated" that's real**, derived from `max(updated_at)` across content tables. Nobody fakes this because nobody can.
- **A "Currently" block that is genuinely current.** Originally credited to alexcoven.com, which doesn't have one — **no site in this capture set has one.** That absence is the argument, not a reason to drop it. On a static site keeping it fresh means a commit and a deploy, so it goes stale and the author quietly removes it. For you it's a textarea in the admin panel and a ten-second edit. It is simultaneously the most useful thing for a visitor and the clearest demonstration of why this architecture exists. It stays in the build — see `site_settings.currently`, rendered in the top bar per `04-build-roadmap.md` S3.
- **Make the breakpoint a reward.** Recalled from an earlier Lynn Fisher redesign and not present in version XIX. Kept as a principle we're choosing: the trace chart rotating from horizontal bars to vertical at narrow widths should feel like a considered second composition, not a degraded first one.
- **Metrics as structured data rather than prose**, which means you can sort, filter and chart them instead of just writing them down. Marble doesn't publish numbers at all; the other four have nothing to publish numbers about.

That is the actual competitive advantage of the dynamic approach, and it's worth designing *toward* rather than treating the admin panel as plumbing.

---

## What re-deriving this changed

Six claims were wrong, and the failure mode was consistent: **I remembered what each site is famous for, and the famous thing was often several redesigns stale.**

| Claim | Reality |
|---|---|
| brittanychiang.com uses `#0a192f` + `#64ffda` | Zero occurrences. Stock Tailwind `slate`/`teal` now. |
| lynnandtonic.com has a recomposing CSS self-portrait | Not in version XIX. No portrait; no recomposition. |
| vanschneider.com sets essays at a reading measure | Viewport-relative 12-column grid. Zero `ch`/`em` max-widths. |
| vanschneider.com's display/body ratio is 7.2× | **8.7×** (200px display, 23px body, 18px root). Wrong in the conservative direction. |
| marblecontentmarketing.com is Webflow/Framer, leads with numbers, has social proof high on the page | WordPress. Zero statistics. Zero testimonials. |
| alexcoven.com has a "Currently" block | Zero occurrences of the word. No such block. |

Of the claims that *did* survive, the brittanychiang mechanisms came through exactly as described — `lg:group-hover/list:opacity-50` and `lg:hover:!opacity-100` appear 14 times each, `absolute -inset-x-4 -inset-y-2.5` 14 times, across 3 `group/list` containers. Structural patterns held up well; **every single failure was a remembered colour, number, or feature.**

Two of those had already reached other documents — the Lynn Fisher portrait was cited in `02-design-direction.md` §3 as precedent for the trace chart, and the "Currently" block drove a real schema column consumed by `04-build-roadmap.md` S3. **Both downstream decisions were re-examined and both survived on their own merits**, which is the useful outcome: the ideas were sound, the sourcing wasn't. Worth remembering before any future "as seen on X" justification goes into a design doc.
